import { HashAlgorithm } from '../shared/hash-algorithm.enum';
import { HashService } from './hash.service';

describe('HashService', () => {
  const testCases: Array<any> = [
    {
      algorithm: HashAlgorithm.MD5,
      input: Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
      expected: '35899082e51edf667f14477ac000cbba'
    },
    {
      algorithm: HashAlgorithm.SHA1,
      input: Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
      expected: 'e7505beb754bed863e3885f73e3bb6866bdd7f8c'
    },
    {
      algorithm: HashAlgorithm.SHA256,
      input: Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
      expected: 'a58dd8680234c1f8cc2ef2b325a43733605a7f16f288e072de8eae81fd8d6433'
    },
    {
      algorithm: HashAlgorithm.SHA384,
      input: Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
      expected: 'ae201b29dc4d8d374a88aff6c1bf845ce73c1d2b5512eb0d673d5b637c48dd5d844224153aab261f17544528be054b1e'
    },
    {
      algorithm: HashAlgorithm.SHA512,
      input: Buffer.from('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
      expected: '19d8350a48bb40d04b4045955a9d95599aa5bd5b8c74c36c098b58c3cd8af142b8d9cf0417ef6dc88c4ed91c69ea8e2adce7afec1afb6a21d8cae681b0902997'
    }
  ];

  testCases.forEach(({ algorithm, input, expected }) => {
    it(`should create digest propery (${algorithm})`, () => {
      const service: HashService = HashService.create(algorithm);
      const actual: string = service.digest(input).toString('hex');

      expect(actual).toEqual(expected);
    });
  });
});
