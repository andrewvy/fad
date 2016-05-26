# Listening for Changes

### Reactive

```js
const Store = fad.createStore()
const Post = fad.createModel('post', Store, {
  propTypes: {
    name: fad.PropTypes.string,
    content: fad.PropTypes.string
  }
})

let blogPost = new Post()

let PostComponent = (props) => {
  <div className='post'>
    <div className='postTitle'>{props.post.title}</div>
    <div className='postContent'>{props.post.content}</div>
  </div>
}

let render = () => {
  ReactDOM.render(<PostComponent post={blogPost} />, mountNode)
}

blogPost
  .stream('*')
  .subscribe((post) => {
    render()
  })

blogPost.set('Hello world!')
```
