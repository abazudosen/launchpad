/* @flow */

import React, { Component } from 'react';
import ReactCodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/keymap/sublime';
import registerLinter from './EditorLinter';
import './Editor.less';

export default class Editor extends Component {
  codemirror: any;

  props: {|
    code: string,
    errors?: any,
    canEdit: boolean,
    onChange: string => any,
  |};

  componentDidMount() {
    registerLinter(this.codemirror.getCodeMirrorInstance());
  }

  renderTitle() {
    if (!this.props.canEdit) {
      return 'Fork to edit the code.';
    }
  }

  render() {
    return (
      <div className="Editor" title={this.renderTitle()}>
        <ReactCodeMirror
          ref={el => (this.codemirror = el)}
          value={this.props.code}
          onChange={this.props.onChange}
          options={{
            theme: 'solarized',
            mode: 'jsx',
            tabSize: 2,
            width: '100%',
            height: '100%',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            readOnly: this.props.canEdit ? false : true,
            lint: true,
            keyMap: 'sublime',
            gutters: [
              'CodeMirror-lint-markers',
              'CodeMirror-linenumbers',
              'CodeMirror-foldgutter',
            ],
          }}
        />
      </div>
    );
  }
}
