const React = require('react');

class ScrollPagination extends React.Component {
  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.state = {
      listener: () => this.handleScroll(),
    };
  }

  componentDidMount() {
    if (this.props.hasMore) {
      window.addEventListener('scroll', this.state.listener);
    }
  }

  componentWillUnmount() {
    if (this.state.listener) {
      window.removeEventListener('scroll', this.state.listener);
    }
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
        {this.renderStatus()}
      </div>
    );
  }

  handleScroll() {
    // find jQuery alternative
    /*
    if ($(window).scrollTop() + $(window).height() === $(document).height()) {
      this.props.loadMore();
    }
   */
  }

  renderStatus() {
    if (!this.props.hasMore) {
      return;
    }

    // TODO: there is a race condition here
    if (this.props.isLoading) {
      return 'Loading...';
    }

    return (
      <span onClick={() => this.props.loadMore()}>Scroll To Load More</span>
    );
  }
}

export default ScrollPagination;
