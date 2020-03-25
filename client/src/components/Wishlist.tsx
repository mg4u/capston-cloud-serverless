import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createWishlistItem, deleteWishlistItem, getWishlist, patchWishlistItem, getUploadUrl, uploadFile } from '../api/wishlist-api'
import Auth from '../auth/Auth'
import { WishlistItem } from '../types/WishlistItem'

interface WishlistProps {
  auth: Auth
  history: History
}

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface WishlistState {
  wishlist: WishlistItem[]
  newWishlistItemName: string
  newWishlistItemReason: string
  loadingWishlist: boolean
  disabled: boolean

  //image upload state
  uploadState: UploadState
  file: any
}

export class Wishlist extends React.PureComponent<WishlistProps, WishlistState> {
  state: WishlistState = {
    wishlist: [],
    newWishlistItemName: '',
    newWishlistItemReason: '',
    loadingWishlist: true,
    disabled: false,

    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newWishlistItemName: event.target.value })
  }

  handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newWishlistItemReason: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  onEditButtonClick = (wishlistItemId: string) => {
    this.props.history.push(`/wishlist/${wishlistItemId}/edit?q=aaaa`)
  }

  onWishlistItemCreate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      if (!this.state.newWishlistItemName || !this.state.newWishlistItemReason) {
        alert('Insert your wish Information :)');
        return;
      }
      const dueDate = this.calculateDueDate()
      this.setState({ disabled: true})
      
      const newWishlistItem = await createWishlistItem(this.props.auth.getIdToken(), {
        name: this.state.newWishlistItemName,
        reason: this.state.newWishlistItemReason,
        dueDate
      })

      if(newWishlistItem && this.state.file)
      {
        await this.setState({uploadState: UploadState.FetchingPresignedUrl})
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newWishlistItem.wishlistItemId)

        await this.setState({uploadState: UploadState.UploadingFile})
        await uploadFile(uploadUrl, this.state.file)
      }
      alert('Your wish added successfully, we wish you best of luck!')
      await this.setState({
        wishlist: [...this.state.wishlist, newWishlistItem],
        newWishlistItemName: '',
        newWishlistItemReason: '',
        file: undefined,
        disabled: false,
        uploadState: UploadState.NoUpload
      })
    } catch {
      alert('WishlistItem creation failed')
    }
  }

  onWishlistItemDelete = async (wishlistItemId: string) => {
    try {
      await deleteWishlistItem(this.props.auth.getIdToken(), wishlistItemId)
      this.setState({
        wishlist: this.state.wishlist.filter(wishlistItem => wishlistItem.wishlistItemId != wishlistItemId)
      })
    } catch {
      alert('WishlistItem deletion failed')
    }
  }

  onWishlistItemCheck = async (pos: number) => {
    try {
      const wishlistItem = this.state.wishlist[pos]
      await patchWishlistItem(this.props.auth.getIdToken(), wishlistItem.wishlistItemId, {
        name: wishlistItem.name,
        reason: wishlistItem.reason,
        dueDate: wishlistItem.dueDate,
        done: !wishlistItem.done
      })
      this.setState({
        wishlist: update(this.state.wishlist, {
          [pos]: { done: { $set: !wishlistItem.done } }
        })
      })
    } catch {
      alert('WishlistItem deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const wishlist = await getWishlist(this.props.auth.getIdToken())
      this.setState({
        wishlist,
        loadingWishlist: false
      })
    } catch (e) {
      alert(`Failed to fetch wishlist: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Wishlist</Header>

        {this.renderCreateWishlistItemInput()}

        {this.renderWishlist()}
      </div>
    )
  }

  renderCreateWishlistItemInput() {
    return (
      <Grid columns='equal'>
        <Grid.Column width={5}>
          <Input
            value={this.state.newWishlistItemName}
            fluid
            placeholder="The wish: Learn better..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={5}>
          <Input
            value={this.state.newWishlistItemReason}
            fluid
            placeholder="The Reason: To make the peaple life better..."
            onChange={this.handleReasonChange}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <input
            type="file"
            accept="image/*"
            placeholder="Image to upload"
            onChange={this.handleFileChange}
          />
        </Grid.Column>
        <Grid.Column width={2}>
          <Button
            primary
            disabled={this.state.disabled}
            onClick={this.onWishlistItemCreate}
          >
            New Wish
          </Button>
          {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
          {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        </Grid.Column>
      </Grid>
    )
  }

  renderWishlist() {
    if (this.state.loadingWishlist) {
      return this.renderLoading()
    }

    return this.renderWishlistList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Wishlist
        </Loader>
      </Grid.Row>
    )
  }

  renderWishlistList() {
    return (
      <Grid padded>
        <Grid.Row key={0}  style={{marginTop: 100}}>
          <Grid.Column width={1} verticalAlign="middle">
          </Grid.Column>
          <Grid.Column width={5} verticalAlign="middle">
            The Wish
          </Grid.Column>
          <Grid.Column width={5} verticalAlign="middle">
            The Reason
          </Grid.Column>
          <Grid.Column width={3} verticalAlign="middle">
            Date you Added
          </Grid.Column>
          <Grid.Column width={1} floated="right">
            Operation
          </Grid.Column>
        </Grid.Row>
        {this.state.wishlist.map((wishlistItem, pos) => {
          return (
            <Grid.Row key={wishlistItem.wishlistItemId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onWishlistItemCheck(pos)}
                  checked={wishlistItem.done}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {wishlistItem.name}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {wishlistItem.reason}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {wishlistItem.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(wishlistItem.wishlistItemId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onWishlistItemDelete(wishlistItem.wishlistItemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {wishlistItem.attachmentUrl && (
                <Image src={wishlistItem.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
