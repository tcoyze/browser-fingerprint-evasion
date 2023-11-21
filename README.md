# CreepJs - Bot Detection Test

Random script compiled for fingerprinting analysis testing for refining evasion techniques

Local setup:

luminati proxy manager running locally

Things of note (ranked from least to most successful):

- Custom mocking + patching was out of date / obsolete - 0
- Puppeteer extra + stealth commands failed massively - 0
- Crawlee (default puppeteer settings) - 7.5
- Plain old puppeteer + proxy + rotating UA - 38.5

Things to follow up on:

- Further investigation on the detection methods and implementing improved evasion techniques
- Code clean up (Switch updated security mocks to Typescript)
- Handle selectors for parsing the HTML (took a shortcut and just captured the JSON payload instead)
