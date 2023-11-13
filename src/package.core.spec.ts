import { expect } from 'chai';
import { functionFromPackage } from './package-core';

describe(`functionFromPackage`, () => {
    it(`should return a string`, () => {
        const result = functionFromPackage();
        expect(typeof result).equal(`string`);
    });
});
