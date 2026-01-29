import { Checkbox as OriginalCheckbox } from '@mantine/core';
import { withController } from '../hocs';

export const Checkbox = withController(OriginalCheckbox, { type: 'checkbox' });
