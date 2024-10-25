import * as yup from 'yup';

const customerSchema = yup.object({
  name: yup.string().min(3, 'Invalid name. Must be at least 3 characters.').required(),
  customerTypeId: yup.number().min(0, 'type is a required field'),
  moduleTypes: yup.array(yup.string()).min(1, 'You need to select at least one module'),
  isBincodes: yup.boolean(),
  bandId: yup.number().min(0, 'band is a required field'),
  startAt: yup.date().required('Please provide start date'),
  endAt: yup.date().required('Please provide end date'),
  enforcing: yup.boolean(), // APPLIED CONTRACT
  active: yup.boolean() // STATE
});

export default customerSchema;
