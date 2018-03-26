/* @flow */

import React from 'react';
import Helmet from 'react-helmet';

import './TitleEditor.less';

type TitleEditorProps = {|
  title: ?string,
  canEdit: boolean,
  githubUsername: ?string,
  onSetTitle: (title: string) => any,
|};

export default class TitleEditor extends React.Component {
  props: TitleEditorProps;

  state: {|
    title: string,
  |};

  constructor(props: TitleEditorProps) {
    super();

    this.state = {
      title: props.title || '',
    };
  }

  handleTitleChange = (evt: SyntheticInputEvent) => {
    this.setState({
      title: evt.target.value,
    });
  };

  saveTitle = () => {
    if (this.state.title !== this.props.title) {
      // Only set title if it was actually changed
      this.props.onSetTitle(this.state.title);
    }
  };

  handleKeyPress = (evt: SyntheticInputEvent) => {
    if (evt.key === 'Enter') {
      this.saveTitle();
    }
  };

  renderTitle() {
    if (this.props.title) {
      return this.props.title;
    } else {
      return <span className="Header-Title--untitled">(Untitled)</span>;
    }
  }

  renderUser() {
    if (this.props.githubUsername) {
      return (
        <span>
          by{' '}
          <a
            href={`https://github.com/${this.props.githubUsername}`}
            target="_blank"
          >
            {this.props.githubUsername}
          </a>
        </span>
      );
    } else {
      return null;
    }
  }

  render() {
    if (this.props.canEdit) {
      return (
        <div className="Title-Editor">
          <Helmet>
            <meta
              name="twitter:title"
              content={
                this.state.title === '' ? 'Untitled Pad' : this.state.title
              }
            />
            <meta
              property="og:title"
              content={
                this.state.title === '' ? 'Untitled Pad' : this.state.title
              }
            />
          </Helmet>
          <div
            className="edit-title-button"
            aria-label="Edit Title and Description"
          >
            <span key="icon-edit" className="icon-edit" />
          </div>

          <input
            type="text"
            className="TitleInput"
            placeholder="Untitled"
            value={this.state.title}
            onChange={this.handleTitleChange}
            onBlur={this.saveTitle}
            onKeyPress={this.handleKeyPress}
          />
        </div>
      );
    } else {
      return (
        <div className="Title">
          <div>
            {this.renderTitle()} {this.renderUser()}
          </div>
        </div>
      );
    }
  }
}
