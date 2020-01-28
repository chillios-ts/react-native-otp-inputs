import React, {
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from 'react';
import {
  Clipboard,
  Keyboard,
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  Platform,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
} from 'react-native';

import OtpInput from './OtpInput';
import { ActionTypes, OtpInputsRef, ReducerState, Actions } from './types';
import { fillOtpCode } from './helpers';

type Props = TextInputProps & {
  keyboardType:
    | 'default'
    | 'email-address'
    | 'phone-pad'
    | 'visible-password'
    | 'ascii-capable'
    | 'numbers-and-punctuation'
    | 'url'
    | 'name-phone-pad'
    | 'twitter'
    | 'web-search'
    | undefined;
  style?: StyleProp<ViewStyle>;
  focusStyles?: StyleProp<ViewStyle>;
  defaultValue?: string;
  handleChange: (otpCode: string) => void;
  inputContainerStyles?: StyleProp<ViewStyle>;
  inputStyles?: StyleProp<TextStyle>;
  isRTL?: boolean;
  numberOfInputs: number;
  testIDPrefix?: string;
};

const ACTION_TYPES: ActionTypes = {
  setHandleChange: 'setHandleChange',
  setOtpTextForIndex: 'setOtpTextForIndex',
  setOtpCode: 'setOtpCode',
  clearOtp: 'clearOtp',
  setHasKeySupport: 'setHasKeySupport',
};

const reducer = (state: ReducerState, action: Actions) => {
  switch (action.type) {
    case ACTION_TYPES.setOtpTextForIndex: {
      const otpCode = { ...state.otpCode, [`${action.payload.index}`]: action.payload.text };
      state.handleChange(Object.values(otpCode).join(''));

      return {
        ...state,
        otpCode,
      };
    }

    case ACTION_TYPES.setOtpCode: {
      const otpCode = fillOtpCode(action.payload.numberOfInputs, action.payload.code);
      state.handleChange(Object.values(otpCode).join(''));

      return {
        ...state,
        otpCode,
      };
    }

    case ACTION_TYPES.clearOtp: {
      const otpCode = fillOtpCode(action.payload);
      state.handleChange(Object.values(otpCode).join(''));

      return { ...state, otpCode };
    }

    case ACTION_TYPES.setHandleChange: {
      return { ...state, handleChange: action.payload };
    }

    case ACTION_TYPES.setHasKeySupport: {
      return { ...state, hasKeySupport: action.payload };
    }

    default:
      return state;
  }
};

const OtpInputs = forwardRef<OtpInputsRef, Props>(
  (
    {
      autoCapitalize = 'none',
      clearTextOnFocus = false,
      defaultValue,
      focusStyles = {
        borderColor: '#00f',
      },
      handleChange = console.log,
      inputContainerStyles = {
        borderBottomWidth: 1,
        height: 53,
        margin: 10,
      },
      inputStyles = {
        fontSize: 24,
        paddingTop: 10,
        textAlign: 'center',
        width: 40,
      },
      isRTL = false,
      keyboardType = 'phone-pad',
      numberOfInputs = 4,
      placeholder = '',
      secureTextEntry = false,
      selectTextOnFocus = true,
      style = {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      testIDPrefix = 'otpInput',
      ...restProps
    },
    ref,
  ) => {
    const [{ otpCode, hasKeySupport }, dispatch] = useReducer(reducer, {}, () => ({
      otpCode: fillOtpCode(numberOfInputs, defaultValue),
      handleChange,
      hasKeySupport: Platform.OS === 'ios',
    }));
    const previousCopiedText: { current: string } = useRef('');
    const inputs: { current: Array<RefObject<TextInput>> } = useRef([]);

    useEffect(() => {
      dispatch({ type: ACTION_TYPES.setHandleChange, payload: handleChange });
    }, [handleChange]);

    useImperativeHandle(
      ref,
      () => ({
        reset: (): void => {
          dispatch({ type: ACTION_TYPES.clearOtp, payload: numberOfInputs });
          inputs.current.forEach(input => input?.current?.clear());
          previousCopiedText.current = '';
          Clipboard.setString('');
        },
        focus: (): void => {
          const firstInput = inputs.current[0];
          firstInput?.current?.focus();
        },
      }),
      [numberOfInputs],
    );

    const handleTextChange = (text: string, index: number) => {
      if (Platform.OS === 'android' && !hasKeySupport) handleInputTextChange(text, index);
    };

    const handleInputTextChange = (text: string, index: number): void => {
      if (!text.length) {
        handleClearInput(index);
      }

      if (text.length > 1) {
        handleClearInput(index);
        Keyboard.dismiss();
        return fillInputs(text);
      }

      if (text) {
        dispatch({
          type: ACTION_TYPES.setOtpTextForIndex,
          payload: {
            text,
            index,
          },
        });
        focusInput(index + 1);
      }

      if (index === numberOfInputs - 1 && text) {
        Keyboard.dismiss();
      }
    };

    const handleKeyPress = (
      { nativeEvent: { key } }: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number,
    ) => {
      handleInputTextChange(key === 'Backspace' ? '' : key, index);

      if (Platform.OS === 'android' && !hasKeySupport && !isNaN(parseInt(key)))
        dispatch({ type: ACTION_TYPES.setHasKeySupport, payload: true });
    };

    const focusInput = useCallback(
      (index: number): void => {
        if (index >= 0 && index < numberOfInputs) {
          const input = inputs.current[index];
          input?.current?.focus();
        }
      },
      [numberOfInputs],
    );

    const handleClearInput = useCallback(
      (inputIndex: number) => {
        const input = inputs.current[inputIndex];
        input?.current?.clear();
        dispatch({
          type: ACTION_TYPES.setOtpTextForIndex,
          payload: {
            index: inputIndex,
            text: '',
          },
        });
        focusInput(inputIndex - 1);
      },
      [focusInput],
    );

    const fillInputs = useCallback(
      (code: string) => {
        dispatch({ type: ACTION_TYPES.setOtpCode, payload: { numberOfInputs, code } });
      },
      [numberOfInputs],
    );

    const listenOnCopiedText = useCallback(async (): Promise<void> => {
      const copiedText = await Clipboard.getString();
      const otpCodeValue = Object.values(otpCode).join('');

      if (
        copiedText &&
        copiedText.length === numberOfInputs &&
        copiedText !== otpCodeValue &&
        copiedText !== previousCopiedText.current
      ) {
        previousCopiedText.current = copiedText;
        fillInputs(copiedText);
      }
    }, [fillInputs, numberOfInputs, otpCode]);

    useEffect(() => {
      const interval = setInterval(() => {
        listenOnCopiedText();
      }, 500);

      return () => {
        clearInterval(interval);
      };
    }, [listenOnCopiedText, numberOfInputs]);

    const renderInputs = (): Array<JSX.Element> => {
      const iterationArray = Array<number>(numberOfInputs).fill(0);

      return iterationArray.map((_, index) => {
        let inputIndex = index;
        if (isRTL) {
          inputIndex = numberOfInputs - 1 - index;
        }
        const inputValue = otpCode[`${inputIndex}`];

        if (!inputs.current[inputIndex]) {
          inputs.current[inputIndex] = React.createRef<TextInput>();
        }

        return (
          <OtpInput
            handleKeyPress={(keyPressEvent: NativeSyntheticEvent<TextInputKeyPressEventData>) =>
              handleKeyPress(keyPressEvent, inputIndex)
            }
            maxLength={Platform.select({
              android: 1,
              ios: index === 0 ? numberOfInputs : 1,
            })}
            autoCapitalize={autoCapitalize}
            clearTextOnFocus={clearTextOnFocus}
            firstInput={index === 0}
            focusStyles={focusStyles}
            handleTextChange={(text: string) => handleTextChange(text, inputIndex)}
            inputContainerStyles={inputContainerStyles}
            inputStyles={inputStyles}
            key={inputIndex}
            keyboardType={keyboardType}
            numberOfInputs={numberOfInputs}
            placeholder={placeholder}
            ref={inputs.current[inputIndex]}
            secureTextEntry={secureTextEntry}
            selectTextOnFocus={selectTextOnFocus}
            testID={`${testIDPrefix}-${inputIndex}`}
            inputValue={inputValue}
            {...restProps}
          />
        );
      });
    };

    return <View style={style}>{renderInputs()}</View>;
  },
);

export { OtpInputsRef };
export default OtpInputs;
