# react-native-otp-inputs

[![CircleCI](https://circleci.com/gh/dsznajder/react-native-otp-inputs/tree/master.svg?style=svg)](https://circleci.com/gh/dsznajder/react-native-otp-inputs/tree/master)

[![codecov](https://codecov.io/gh/dsznajder/react-native-otp-inputs/branch/master/graph/badge.svg)](https://codecov.io/gh/dsznajder/react-native-otp-inputs)

![npm](https://img.shields.io/npm/dw/react-native-otp-inputs.svg)
![npm](https://img.shields.io/npm/v/react-native-otp-inputs.svg)

### Demo

![Demo](https://user-images.githubusercontent.com/17621507/36565065-a03b98b0-181f-11e8-9a54-09d978bec892.gif)

## Description

`react-native-otp-inputs` is fully customizable, pure JavaScript package, that provides solution for One-time password feature with user friendly events like moving to previous input with backspace or going to next when filled in. It supports pasting and otp code into inputs

## Installation

| React-Native version | installation                           |
| -------------------- | -------------------------------------- |
| >= 0.53.0 < 0.57.0   | yarn add react-native-otp-inputs@1.1.0 |
| <= 0.57.0            | yarn add react-native-otp-inputs       |

**_It's because of `onKeyPress` event implementation on android._**

## Basic usage

```js
import React, { Component } from 'react';
import { View } from 'react-native';
import OtpInputs from 'react-native-otp-inputs';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <OtpInputs handleChange={code => console.log(code)} numberOfInputs={6} />
      </View>
    );
  }
}
```

## API

| Method                      | Type           | Required    | Default                                                                                                    | Description                                                                                                         |
| --------------------------- | -------------- | ----------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| autoCapitalize              | string         | false       | 'none'                                                                                                     | Defines input auto capitalization (only use with keyboardType)                                                      |
| clearTextOnFocus            | boolean        | false       | false                                                                                                      | Defines if input text should be cleared on focus                                                                    |
| containerStyles             | style (object) | false       | none                                                                                                       | Styles applied to whole container                                                                                   |
| errorMessage                | string         | false       | none                                                                                                       | Error message that is displayed above inputs                                                                        |
| errorMessageContainerStyles | style (object) | false       | [defaultStyles](https://github.com/dsznajder/react-native-otp-inputs/blob/master/lib/defaultStyles.ts#L28) | Styles applied to error message container                                                                           |
| errorMessageTextStyles      | style (object) | false       | none                                                                                                       | Styles applied to error message text                                                                                |
| focusedBorderColor          | string         | false       | #0000ff                                                                                                    | borderColor of input when focused                                                                                   |
| focusStyles                 | style (object) | false       | none                                                                                                       | Styles applied to the input when its focused                                                                        |
| handleChange                | function       | true        | console.log                                                                                                | Returns otp code which is typed in inputs                                                                           |
| inputStyles                 | style(object)  | false       | [defaultStyles](https://github.com/dsznajder/react-native-otp-inputs/blob/master/lib/defaultStyles.ts#L15) | Styles applied to single input                                                                                      |
| inputContainerStyles        | style (object) | false       | [defaultStyles](https://github.com/dsznajder/react-native-otp-inputs/blob/master/lib/defaultStyles.ts#L8)  | Styles applied to each input container                                                                              |
| inputsContainerStyles       | style (object) | false       | [default](./src/OtpInput.tsx#L)                                                                            | Styles applied to inputs container                                                                                  |
| inputTextErrorColor         | string         | false       | #ff0000                                                                                                    | Color of text inside input container when error is passed in                                                        |
| keyboardType                | string         | true        | 'phone-pad'                                                                                                | Keyboard type for inputs                                                                                            |
| numberOfInputs              | number         | true (1..6) | 4                                                                                                          | How many inputs should be rendered                                                                                  |
| secureTextEntry             | boolean        | false       | false                                                                                                      | Defines if input will hide text inside                                                                              |
| selectTextOnFocus           | boolean        | false       | true                                                                                                       | [iOS Only](./src/OtpInput.tsx#L90) Defines if input text should be selected on focus                                |
| unfocusedBorderColor        | string         | false       | transparent                                                                                                | borderColor of input when not focused                                                                               |
| testIDPrefix                | string         | false       | otpInput-\${inputIndex}                                                                                    | Prefix that will be applied as a testID for each input                                                              |
| isRTL                       | boolean        | false       | false                                                                                                      | Defines if the app is currently in RTL (preferably pass {I18nManager.isRTL}). Keeps the OTP boxes in LTR alignment. |
| placeholder                 | string         | false       | none                                                                                                       | Placeholder for the input boxes.                                                                                    |

## Methods

Those can be called on ref:

```js
import React, { Component } from 'react';
import { Button, View } from 'react-native';
import OtpInputs from 'react-native-otp-inputs';

export default class App extends Component {
  otpRef = React.createRef();

  resetOTP = () => {
    otpRef.current.reset();
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Reset" onPress={this.resetOTP} />
        <OtpInputs ref={this.otpRef} handleChange={code => console.log(code)} numberOfInputs={6} />
      </View>
    );
  }
}
```

| Method | Description                                                    |
| ------ | -------------------------------------------------------------- |
| reset  | Reset inputs and returns to `handleChange` method empty string |

### Contributors

Great thanks to :
[@kantorm](https://github.com/kantorm).
