import yearMonthField from './custom-fields/year-month';

export default {
  register(app: any) {
    app.customFields.register(yearMonthField);
  },
}; 