import React from "react";
import "./App.css";
import { Component } from "react";
import request from "superagent";
import moment from "moment";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";

class App extends Component {
  constructor(props) {
    super(props);

    // Sets up our initial state
    this.state = {
      error: false,
      hasMore: true,
      isLoading: false,
      users: [],
      page: 1
    };

    // Binds our scroll event handler
    window.onscroll = () => {
      const {
        loadUsers,
        state: { error, isLoading, hasMore }
      } = this;

      // Bails early if:
      // * there's an error
      // * it's already loading
      // * there's nothing left to load
      if (error || isLoading || !hasMore) return;

      // Checks that the page has scrolled to the bottom
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        loadUsers();
      }
    };
  }

  componentWillMount() {
    // Loads some users on initial load
    this.loadUsers();
  }

  loadUsers = () => {
    var fetchDate = moment()
      .subtract(30, "days")
      .format("YYYY-MM-DD");
    var sourceUrl =
      "https://api.github.com/search/repositories?q=created:>" +
      fetchDate +
      "&sort=stars&order=desc" +
      (this.state.page > 1 ? "&page=" + this.state.page : "");
    this.setState({ isLoading: true }, () => {
      request
        .get(sourceUrl)
        .then(results => {
          // Creates a massaged array of user data
          console.log(results.body);
          const nextUsers = results.body.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            stargazers_count: item.stargazers_count,
            open_issues_count: item.open_issues_count,
            ownerlogin: item.owner.login,
            photo: item.owner.avatar_url,
            created_at: item.created_at
          }));

          // Merges the next users into our existing users
          this.setState({
            // Note: Depending on the API you're using, this value may be
            // returned as part of the payload to indicate that there is no
            // additional data to be loaded
            hasMore: this.state.users.length < 100,
            isLoading: false,
            users: [...this.state.users, ...nextUsers],
            page: this.state.page + 1
          });
        })
        .catch(err => {
          this.setState({
            error: err.message,
            isLoading: false
          });
        });
    });
  };

  render() {
    const { error, hasMore, isLoading, users } = this.state;

    return (
      <div>
        {users.map(user => (
          <List>
            <ListItem key={user.id}>
              <ListItemAvatar>
                <Avatar alt="Remy Sharp" src={user.photo} />
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <>
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {user.description}{" "}
                      </Typography>
                    </React.Fragment>
                    <br />
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        <button
                          type="button"
                          className="btn btn-light border mr-2"
                        >
                          Stars:{" "}
                          <span className="badge badge-warning">
                            {user.stargazers_count}{" "}
                          </span>
                        </button>
                      </Typography>
                    </React.Fragment>
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        <button
                          type="button"
                          className="btn btn-light border mr-2"
                        >
                          Issues:{" "}
                          <span className="badge badge-warning">
                            {user.open_issues_count}{" "}
                          </span>
                        </button>
                      </Typography>
                    </React.Fragment>
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        Submitted{" "}
                        {moment(new Date()).diff(user.created_at, "days")} days
                        ago by
                        <a href="{{ user.ownerlogin}}" target="_blank">
                          {" "}
                          {user.ownerlogin}
                        </a>{" "}
                      </Typography>
                    </React.Fragment>
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </List>
        ))}
        <hr />
        {error && <div style={{ color: "#900" }}>{error}</div>}
        {isLoading && <div>Loading...</div>}
        {!hasMore && <div>You did it! You reached the end!</div>}
      </div>
    );
  }
}

export default App;
