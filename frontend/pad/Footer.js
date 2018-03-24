/* @flow */

import React from 'react';
import extendLogo from '../../static/auth0-extend-logo.svg';
import './Footer.less';

type FooterProps = {|
  isDraft: boolean,
  isDeployed: boolean,
  canSeeLogs: boolean,
  url: ?string,
  isLogOpen: boolean,
  error: ?string,
  onResetLinkClick: Event => any,
  onLogOpen: () => any,
  onLogClose: () => any,
  onModalOpen: (type: 'dependencies' | 'secrets') => any,
|};

export default class Footer extends React.Component {
  props: FooterProps;

  handleToggleLog = () => {
    if (this.props.isLogOpen) {
      this.props.onLogClose();
    } else {
      this.props.onLogOpen();
    }
  };

  renderError() {
    if (this.props.error) {
      let resetSuffix;
      if (this.props.isDeployed) {
        resetSuffix = (
          <span>
            Click to{' '}
            <a href="#" onClick={this.props.onResetLinkClick}>
              reset
            </a>{' '}
            to saved version.
          </span>
        );
      }
      return (
        <div className="Footer-ErrorWrapper">
          <code className="Footer-ErrorText">
            {this.props.error} {resetSuffix}
          </code>
        </div>
      );
    }
  }

  renderDraftWarning() {
    if (!this.props.error && this.props.isDeployed && this.props.isDraft) {
      return (
        <div className="Footer-ErrorWrapper Footer-ErrorWrapper--yellow">
          <code className="Footer-ErrorText">
            Editing draft, save to deploy changes or{' '}
            <a href="#" onClick={this.props.onResetLinkClick}>
              reset
            </a>{' '}
            to saved version.
          </code>
        </div>
      );
    } else {
      return null;
    }
  }

  renderShareUrl() {
    if (!this.props.error && !this.props.isDraft && this.props.url) {
      return (
        <div className="Footer-EndpointURL">
          <span>GraphQL Endpoint:</span>
          <span className="EndpointURL">{this.props.url}</span>
        </div>
      );
    } else {
      return null;
    }
  }

  renderLogButton() {
    let className = 'footer-button';
    if (!this.props.canSeeLogs) {
      className += ' disabled';
    }

    return (
      <div className={className} onClick={this.handleToggleLog}>
        <span className="icon-list-unordered" />
        Logs
      </div>
    );
  }

  render() {
    return (
      <div className="Footer">
        <div className="Footer-Left">
          <div
            className="footer-button"
            onClick={() => this.props.onModalOpen('secrets')}
          >
            <span className="icon-lock" />
            <span>Secrets</span>
          </div>
          <div
            className="footer-button"
            onClick={() => this.props.onModalOpen('dependencies')}
          >
            <span className="icon-paperclip" />
            <span>npm Deps</span>
          </div>

          {this.renderLogButton()}
        </div>

        {this.renderShareUrl()}
        {this.renderDraftWarning()}
        {this.renderError()}

        <div className="Footer-Right">
          <div className="footer-button">
            <span className="icon-book" />
            <a href="https://github.com/apollographql/awesome-launchpad/">
              Docs
            </a>
          </div>
          <div className="powered-by">
            <span>Powered by</span>
            <a href="https://auth0.com/extend/developers">
              <img
                className="extend-logo"
                src={extendLogo}
                alt="Auth0 Extend Logo"
              />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
