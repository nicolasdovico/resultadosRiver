module.exports = {
  riverApi: {
    input: './api-docs.json',
    output: {
      mode: 'tags-split',
      target: 'api/generated/endpoints',
      schemas: 'api/generated/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
