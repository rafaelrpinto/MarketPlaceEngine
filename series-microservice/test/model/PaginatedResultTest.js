"use strict"

/*
	Test case for PaginatedResult.js
*/
let chai = require("chai")
let expect = chai.expect;
let assert = chai.assert;

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
			assert(victim.totalResultCount === 0, "Zeros should be allowed on the 'totalResultCount' property");
		});
		it('Inconsistent "totalResultCount" parameter', () => {
			expect(() => new PaginatedResult([1, 1], 1, 1)).to.throw("Inconsistent state. 'totalResultCount' is less than 'pageResults' count (1/2)");
		});
		it('Default "pageSize" parameter', () => {
			let victim = new PaginatedResult([], 1, 1);
			assert(victim.pageSize === 10, "The default page size should be 10!");
		});
		it('"totalPageCount" for no results', () => {
			let victim = new PaginatedResult([], 1, 0);
			assert(victim.totalPageCount === 1, "The value of 'totalPageCount' should be 1!");
		});
		it('"totalPageCount" for one page', () => {
			let victim = new PaginatedResult([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1, 10);
			assert(victim.totalPageCount === 1, "The value of 'totalPageCount' should be 1!");
		});
		it('"totalPageCount" for multiple pages', () => {
			let victim = new PaginatedResult([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 1, 11);
			assert(victim.totalPageCount === 2, "The value of 'totalPageCount' should be 2!");
		});
		it('Full integrity test', () => {
			let victim = new PaginatedResult([1, 2, 3, 4], 1, 11, 4);
			assert(victim.pageResults.length === 4, "The results length should be 4.");
			assert(victim.pageSize === 4, "The value of 'pageSize' should be 4.");
			assert(victim.currentPage === 1, "The value of 'currentPage' should be 1.");
			assert(victim.totalResultCount === 11, "The value of 'totalResultCount' should be 11.");
			assert(victim.totalPageCount === 3, "The value of 'totalPageCount' should be 3.");
		});
	});
});
