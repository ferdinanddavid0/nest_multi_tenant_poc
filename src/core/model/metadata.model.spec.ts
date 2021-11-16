import { Metadata } from './metadata.model';

describe('MetaData', () => {
  it('should have "1" as default version', function () {
    const model: Metadata = new Metadata();
    expect(model).toBeTruthy();
    expect(model.get('v')).toEqual('1');
  });

  it('should properly override version', function () {
    const model: Metadata = new Metadata({ v: '12' });
    expect(model).toBeTruthy();
    expect(model.get('v')).toEqual('12');
  });

  it('should set, get, and delete value', function () {
    const model: Metadata = new Metadata({ name: 'Lorem' });
    expect(model).toBeTruthy();
    expect(model.get('name')).toEqual('Lorem');
    expect(model.get('value')).toEqual(undefined);

    model.set('value', 'Ipsum');
    expect(model.get('value')).toEqual('Ipsum');

    model.remove('value');
    expect(model.get('value')).toEqual(undefined);
  });

  describe('Serialize', () => {
    const testCases: Array<{ input: any; expected: string }> = [
      { input: { v: '1', sep: '$' }, expected: 'eyJzZXAiOiIkIiwidiI6IjEifQ==' },
      { input: { v: '1', dollar: '$1$2$3' }, expected: 'eyJkb2xsYXIiOiIkMSQyJDMiLCJ2IjoiMSJ9' },
      { input: { v: '1', pct: '%value%' }, expected: 'eyJwY3QiOiIldmFsdWUlIiwidiI6IjEifQ==' },
      { input: { v: '1', que: '?que' }, expected: 'eyJxdWUiOiI/cXVlIiwidiI6IjEifQ==' },
      { input: { v: '1', eq: '?que=10&sera=sera' }, expected: 'eyJlcSI6Ij9xdWU9MTAmc2VyYT1zZXJhIiwidiI6IjEifQ==' },
      { input: { v: '1', col: '?lorem:ipsum' }, expected: 'eyJjb2wiOiI/bG9yZW06aXBzdW0iLCJ2IjoiMSJ9' },

      { input: { v: '1', $: '$' }, expected: 'eyIkIjoiJCIsInYiOiIxIn0=' },
      { input: { v: '1', '%': '%' }, expected: 'eyIlIjoiJSIsInYiOiIxIn0=' },
      { input: { v: '1', ':': '::' }, expected: 'eyI6IjoiOjoiLCJ2IjoiMSJ9' },

      // invalid values
      { input: { v: '1', nul: null }, expected: 'eyJ2IjoiMSJ9' },
      { input: { v: '1', und: undefined }, expected: 'eyJ2IjoiMSJ9' },

      // empty string is valid
      { input: { v: '1', emp: '' }, expected: 'eyJlbXAiOiIiLCJ2IjoiMSJ9' },
      { input: { v: '1', '': '' }, expected: 'eyIiOiIiLCJ2IjoiMSJ9' }
    ];

    testCases.forEach(({ input, expected }, index) => {
      it(`test case #${index + 1}`, () => {
        const actual: string = new Metadata(input).serialize();
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('Deserialize', () => {
    const testCases: Array<{ input: string; expected: any; json: string }> = [
      // malformed input
      { expected: { v: '1' }, json: '{"map":{"v":"1"}}', input: undefined },
      { expected: { v: '1' }, json: '{"map":{"v":"1"}}', input: null },
      { expected: { v: '1' }, json: '{"map":{"v":"1"}}', input: '' },
      { expected: { v: '1', e: undefined }, json: '{"map":{"v":"1"}}', input: 'e' },
      { expected: { v: '1', e: undefined }, json: '{"map":{"v":"1"}}', input: 'e:' },
      { expected: { v: '1' }, json: '{"map":{"v":"1"}}', input: 'eyJlIjp9' },
      { expected: { v: '1' }, json: '{"map":{"v":"1"}}', input: 'Og==' },
      { expected: { v: '1' }, json: '{"map":{"v":"1","":""}}', input: 'eyIiOiIifQ==' },
      { expected: { v: '1', '': undefined }, json: '{"map":{"v":"1"}}', input: 'eyIiOn0=' },

      { expected: { v: '1', sep: '$' }, json: '{"map":{"v":"1","sep":"$"}}', input: 'eyJzZXAiOiIkIiwidiI6IjEifQ==' },
      { expected: { v: '1', dollar: '$1$2$3' }, json: '{"map":{"v":"1","dollar":"$1$2$3"}}', input: 'eyJkb2xsYXIiOiIkMSQyJDMiLCJ2IjoiMSJ9' },
      { expected: { v: '1', pct: '%value%' }, json: '{"map":{"v":"1","pct":"%value%"}}', input: 'eyJwY3QiOiIldmFsdWUlIiwidiI6IjEifQ==' },
      { expected: { v: '1', que: '?que' }, json: '{"map":{"v":"1","que":"?que"}}', input: 'eyJxdWUiOiI/cXVlIiwidiI6IjEifQ==' },
      { expected: { v: '1', eq: '?que=1&sera=2' }, json: '{"map":{"v":"1","eq":"?que=1&sera=2"}}', input: 'eyJ2IjoiMSIsImVxIjoiP3F1ZT0xJnNlcmE9MiJ9' },
      { expected: { v: '1', col: '?lorem:ipsum' }, json: '{"map":{"v":"1","col":"?lorem:ipsum"}}', input: 'eyJjb2wiOiI/bG9yZW06aXBzdW0iLCJ2IjoiMSJ9' },

      { expected: { v: '1', $: '$' }, json: '{"map":{"v":"1","$":"$"}}', input: 'eyIkIjoiJCIsInYiOiIxIn0=' },
      { expected: { v: '1', '%': '%' }, json: '{"map":{"v":"1","%":"%"}}', input: 'eyIlIjoiJSIsInYiOiIxIn0=' },
      { expected: { v: '1', ':': '::' }, json: '{"map":{"v":"1",":":"::"}}', input: 'eyI6IjoiOjoiLCJ2IjoiMSJ9' },

      // empty values
      { expected: { v: '1', emp: '' }, json: '{"map":{"v":"1","emp":""}}', input: 'eyJlbXAiOiIiLCJ2IjoiMSJ9' },
      { expected: { v: '1' }, json: '{"map":{"v":"1"}}', input: 'eyJlbXAiOm51bGwsInYiOiIxIn0=' },
      { expected: { v: '4' }, json: '{"map":{"v":"4"}}', input: 'eyJ2IjoiNCJ9' }
    ];

    testCases.forEach(({ input, expected, json }, index) => {
      it(`test case #${index + 1}`, () => {
        const actual: Metadata = new Metadata().deserialize(input);

        // validate all structure are the same
        expect(JSON.stringify(actual)).toEqual(json);

        // validate every property
        Object.keys(expected).forEach((key: string) => {
          expect(expected[key]).toEqual(actual.get(key));
        });
      });
    });
  });
});
