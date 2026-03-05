module.exports = {
  plugins: [],
  extends: ["@commitlint/config-conventional"],
  rules: {
    //'references-empty': [2, 'never'], // Asks for a ticket/issue number, disabled for starter project, please enable on real projects.
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ["PROJ-"], // Prefix of the ticket/issue number, including the separator (ex. Jira project code + '-')
    },
  },
};
