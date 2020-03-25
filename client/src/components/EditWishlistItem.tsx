import * as React from 'react'
import { History } from 'history'
import dateFormat from 'dateformat'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchWishlistItem, getWishlist } from '../api/wishlist-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditWishlistItemProps {
  match: {
    params: {
      wishlistItemId: string
    }
  }
  auth: Auth
  history: History
}


interface EditWishlistItemState {
  wishlistItemName: string
  wishlistItemReason: string
  loadingWishlist: boolean
  disabled: boolean
  file: any
  uploadState: UploadState
}

export class EditWishlistItem extends React.PureComponent<
  EditWishlistItemProps,
  EditWishlistItemState
> {
  state: EditWishlistItemState = {
    wishlistItemName: '',
    wishlistItemReason: '',
    loadingWishlist: true,
    disabled: false,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  async componentDidMount() {
    try {
      const wishlist = await getWishlist(this.props.auth.getIdToken())
      const wishlistItem= wishlist.filter(item=> item.wishlistItemId == this.props.match.params.wishlistItemId)[0]
      // console.log(this.props.match.params.wishlistItemId, wishlistItem);
      
      this.setState({
        wishlistItemName: wishlistItem.name,
        wishlistItemReason: wishlistItem.reason,
        loadingWishlist: false
      })
    } catch (e) {
      alert(`Failed to fetch wishlist: ${e.message}`)
    }
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ wishlistItemName: event.target.value })
  }

  handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ wishlistItemReason: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }
      const dueDate = this.calculateDueDate()

      const wishlistItem = await patchWishlistItem(this.props.auth.getIdToken(), this.props.match.params.wishlistItemId, {
        name: this.state.wishlistItemName,
        reason: this.state.wishlistItemReason,
        dueDate,
        done: false
      })
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.wishlistItemId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
      this.props.history.goBack();
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>The wish</label>
            <input
              value={this.state.wishlistItemName}
              placeholder="The wish: Learn better..."
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>The Reason</label>
            <input
              value={this.state.wishlistItemReason}
              placeholder="The Reason: To make the peaple life better..."
              onChange={this.handleReasonChange}
            />
          </Form.Field>
          <Form.Field>
            <label>File To Approve</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
