import * as yup from 'yup';

export const CHART_TYPE_MAP = {
  0: 'Any',
  1: 'Custom',
  2: 'Domain Protection',
  3: 'Credit Card',
  4: 'Credit Card',
  5: 'Credit Card',
  6: 'Credit Card',
  7: 'Mobile Apps',
  9: 'Malware',
  10: 'Credentials',
  11: 'Data Leakage',
  14: 'Social Media',
  20: 'Hacktivism',
  25: 'Media tracker',
  26: 'Dark Web',
  28: 'Threat Context',
  29: 'Explorer'
};

export const chartForm = yup.object({
  id: yup.number().nullable(),
  title: yup.string().required(),
  isPrivate: yup.boolean(),
  organizationId: yup.number().nullable(),
  moduleId: yup.number().nullable(),
  type: yup.number().nullable(),
  graphicDataGenId: yup.number().required(),
  graphicStyleId: yup.number().required(),
  values: yup.array(
    yup.object({
      paramId: yup.number().required(),
      value: yup.string()
    })
  )
});

export type ChartFormType = yup.InferType<typeof chartForm>
