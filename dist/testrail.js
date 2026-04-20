"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRailClient = void 0;
var axios = require('axios');
var axiosRetry = require('axios-retry');
var FormData = require('form-data');
var fs = require('fs');
var https = require('https');
var TestRailClient = /** @class */ (function () {
    function TestRailClient(options) {
        var _this = this;
        this.options = options;
        this.indexUri = "/index.php?";
        this.uri = "".concat(this.indexUri, "/api/v2");
        this.commonHeaders = { 'Content-Type': 'application/json' };
        this.agent = new https.Agent({
            rejectUnauthorized: false, // to ignore the self-signed certificate error
        });
        this.handlePaginatedGetAxios = function (requestUrl, itemName, items, resolve, reject) {
            var __this = _this;
            _this.axiosInstance.get(requestUrl, {
                headers: _this.commonHeaders,
                auth: {
                    username: _this.options.username,
                    password: _this.options.password,
                }
            })
                .then(function (response) {
                var retrievedItems = items.concat(response.data[itemName]);
                if (response.data._links.next !== null) {
                    __this.handlePaginatedGetAxios("".concat(__this.indexUri, "/").concat(response.data._links.next), itemName, retrievedItems, resolve, reject);
                }
                else {
                    resolve(retrievedItems);
                }
            })
                .catch(function (error) { reject(error); });
        };
        this.axiosInstance = axios.create({
            // https://axios-http.com/docs/req_config
            httpsAgent: this.agent,
            baseURL: "https://".concat(options.domain),
        });
        axiosRetry(this.axiosInstance, { retries: 3 });
    }
    TestRailClient.prototype.addRun = function (name, description, projectId, suiteId, cases, milestoneId, refs) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var body = {
                name: name,
                description: description,
                include_all: false,
                case_ids: cases,
            };
            if (suiteId) {
                body["suite_id"] = suiteId;
            }
            if (milestoneId) {
                body["milestone_id"] = milestoneId;
            }
            if (refs) {
                body["refs"] = refs;
            }
            _this.axiosInstance.post("".concat(_this.uri, "/add_run/").concat(projectId), JSON.stringify(body), {
                headers: _this.commonHeaders,
                auth: {
                    username: _this.options.username,
                    password: _this.options.password,
                }
            })
                .then(function (response) { resolve(response.data.id); })
                .catch(function (error) { reject(error); });
        });
    };
    TestRailClient.prototype.getTests = function (runId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.handlePaginatedGetAxios("".concat(_this.uri, "/get_tests/").concat(runId), 'tests', [], resolve, reject);
        });
    };
    TestRailClient.prototype.getCases = function (projectId, suiteId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var params = ""
                + (suiteId ? "/&suite_id=".concat(suiteId) : "");
            _this.handlePaginatedGetAxios("".concat(_this.uri, "/get_cases/").concat(projectId).concat(params), 'cases', [], resolve, reject);
        });
    };
    ;
    TestRailClient.prototype.closeRun = function (runId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.axiosInstance.post("".concat(_this.uri, "/close_run/").concat(runId), {}, {
                headers: _this.commonHeaders,
                auth: {
                    username: _this.options.username,
                    password: _this.options.password,
                },
            })
                .then(function (res) { resolve(res); })
                .catch(function (error) { reject(error); });
        });
    };
    TestRailClient.prototype.addResultsForCases = function (runId, results) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.axiosInstance.post("".concat(_this.uri, "/add_results_for_cases/").concat(runId), JSON.stringify({ "results": results }), {
                headers: _this.commonHeaders,
                auth: {
                    username: _this.options.username,
                    password: _this.options.password,
                }
            })
                .then(function (response) {
                resolve(response.data);
            })
                .catch(function (error) { reject(error); });
        });
    };
    TestRailClient.prototype.addAttachmentToResult = function (resultId, filePath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var formData = new FormData();
            var file = fs.createReadStream(filePath);
            formData.append("attachment", file);
            _this.axiosInstance.post("".concat(_this.uri, "/add_attachment_to_result/").concat(resultId), formData, {
                headers: { "Content-Type": "multipart/form-data; boundary=".concat(formData._boundary) },
                auth: {
                    username: _this.options.username,
                    password: _this.options.password,
                }
            })
                .then(function (response) {
                resolve(response);
            })
                .catch(function (error) { reject(error); });
        });
    };
    TestRailClient.prototype.updateRunDescription = function (runId, description) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.axiosInstance.post("".concat(_this.uri, "/update_run/").concat(runId), JSON.stringify({ "description": description }), {
                headers: _this.commonHeaders,
                auth: {
                    username: _this.options.username,
                    password: _this.options.password,
                }
            })
                .then(function (response) {
                resolve(response);
            })
                .catch(function (error) { reject(error); });
        });
    };
    return TestRailClient;
}());
exports.TestRailClient = TestRailClient;
;
//# sourceMappingURL=testrail.js.map