import {
  RadioGroup as OriginalRadioGroup,
  Radio as OriginalRadio,
} from '@mantine/core';
import { withController } from '../hocs';

export const RadioGroup = withController(OriginalRadioGroup);
export const Radio = withController(OriginalRadio, { type: 'checkbox' });
