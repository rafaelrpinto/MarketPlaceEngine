"use strict"
const chai = require("chai");
const expect = chai.expect;
chai.should();

//Victim
let PaginatedResult = require('../../model/PaginatedResult');

describe('PaginatedResult.js', () => {
    describe('#new PaginatedResult()', () => {
        it('Null "pageResults" parameter', () => {
            expect(() => new PaginatedResult(null, 1, 1)).to.throw("Invalid 'pageResults' parameter");
        });
        it('Not Array "pageResults" parameter', () => {
            expect(() => new PaginatedResult({}, 1, 1)).to.throw("Invalid 'pageResults' parameter");
        });
        it('Null "currentPage" parameter', () => {
            expect(() => new PaginatedResult([], null, 1)).to.throw("Invalid 'currentPage' parameter");
        });
        it('NaN "currentPage" parameter', () => {
            expect(() => new PaginatedResult([], "Rafael", 1)).to.throw("Invalid 'currentPage' parameter");
        });
        it('Zero "currentPage" parameter', () => {
            expect(() => new PaginatedResult([], 0, 1)).to.throw("Invalid 'currentPage' parameter");
        });
        it('Double "currentPage" parameter', () => {
            expect(() => new PaginatedResult([], 1.5, 1)).to.throw("Invalid 'currentPage' parameter");
        });
        it('Null "totalResultCount" parameter', () => {
            expect(() => new PaginatedResult([], 1, null)).to.throw("Invalid 'totalResultCount' parameter");
        });
        it('NaN "totalResultCount" parameter', () => {
            expect(() => new PaginatedResult([], 1, "Rafael")).to.throw("Invalid 'totalResultCount' parameter");
        });
        it('Double "totalResultCount" parameter', () => {
            expect(() => new PaginatedResult([], 1, 1.5)).to.throw("Invalid 'totalResultCount' parameter");
        });
        it('Zero "totalResultCount" parameter', () => {
            let victim = new PaginatedResult([], 1, 0);
            victim.totalResultCount.should.be.equals(0);
        });
        it('Inconsistent "totalResultCount" parameter', () => {
            expect(() => new PaginatedResult([
                1, 1
            ], 1, 1)).to.throw("Inconsistent state. 'totalResultCount' is less than 'pageResults' count (1/2)");
        });
        it('Default "pageSize" parameter', () => {
            let victim = new PaginatedResult([], 1, 1);
            victim.pageSize.should.be.equals(10);
        });
        it('"totalPageCount" for no results', () => {
            let victim = new PaginatedResult([], 1, 0);
            victim.totalPageCount.should.be.equals(1);
        });
        it('"totalPageCount" for one page', () => {
            let victim = new PaginatedResult([
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ], 1, 10);
            victim.totalPageCount.should.be.equals(1);
        });
        it('"totalPageCount" for multiple pages', () => {
            let victim = new PaginatedResult([
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11
            ], 1, 11);
            victim.totalPageCount.should.be.equals(2);
        });
        it('Full integrity test', () => {
            let victim = new PaginatedResult([
                1, 2, 3, 4
            ], 1, 11, 4);

            victim.pageResults.should.be.lengthOf(4);
            victim.pageSize.should.be.equals(4);
            victim.currentPage.should.be.equals(1);
            victim.totalResultCount.should.be.equals(11);
            victim.totalPageCount.should.be.equals(3);
        });
    });
});
