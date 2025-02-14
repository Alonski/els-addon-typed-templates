"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_uri_1 = require("vscode-uri");
const vscode_languageserver_1 = require("vscode-languageserver");
const fs = require("fs");
const utils_1 = require("./utils");
const ast_helpers_1 = require("./ast-helpers");
function normalizeDefinitions(results) {
    return (results || [])
        .map(el => {
        return tsDefinitionToLocation(el);
    });
}
exports.normalizeDefinitions = normalizeDefinitions;
function normalizeCompletions(tsResults, realPath, isArg) {
    return (tsResults ? tsResults.entries : [])
        .filter(({ name }) => !name.startsWith("_t") && !name.includes(' - ') && name !== 'globalScope')
        .map(el => {
        return {
            label: isArg
                ? ast_helpers_1.serializeArgumentName(realPath) + el.name
                : realPath + el.name,
            data: el.name,
            kind: utils_1.itemKind(el.kind)
        };
    });
    // .map(el => {
    //   let fixedLabelParts = el.label.split('.');
    //   fixedLabelParts[fixedLabelParts.length - 1] = el.data;
    //   return {
    //     kind: el.kind,
    //     label: fixedLabelParts.join('.')
    //   }
    // });
}
exports.normalizeCompletions = normalizeCompletions;
function offsetToRange(start, limit, source) {
    let rLines = /(.*?(?:\r\n?|\n|$))/gm;
    let startLine = source.slice(0, start).match(rLines) || [];
    if (!source || startLine.length < 2) {
        return vscode_languageserver_1.Range.create(0, 0, 0, 0);
    }
    let line = startLine.length - 2;
    let col = startLine[startLine.length - 2].length;
    let endLine = source.slice(start, limit).match(rLines) || [];
    let endCol = col;
    let endLineNumber = line;
    if (endLine.length === 1) {
        endCol = col + limit;
        endLineNumber = line + endLine.length - 1;
    }
    else {
        endCol = endLine[endLine.length - 1].length;
    }
    return vscode_languageserver_1.Range.create(line, col, endLineNumber, endCol);
}
exports.offsetToRange = offsetToRange;
function tsDefinitionToLocation(el) {
    let scope = el.textSpan;
    let file = fs.readFileSync(el.fileName, "utf8");
    return vscode_languageserver_1.Location.create(vscode_uri_1.URI.file(el.fileName).toString(), offsetToRange(scope.start, scope.length, file));
}
exports.tsDefinitionToLocation = tsDefinitionToLocation;
function toFullDiagnostic(err) {
    let preErrorText = err.file.text.slice(0, err.start);
    let preError = preErrorText.slice(preErrorText.lastIndexOf('//@mark'), preErrorText.length);
    let mark = preError.slice(preError.indexOf('[') + 1, preError.indexOf(']')).trim();
    let [start, end] = mark.split(':');
    let [startCol, startRow] = start.split(',').map((e) => parseInt(e, 10));
    let [endCol, endRow] = end.split(',').map((e) => parseInt(e, 10));
    return {
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
        range: vscode_languageserver_1.Range.create(startCol - 1, startRow, endCol - 1, endRow),
        message: err.messageText,
        source: "typed-templates"
    };
}
function getFullSemanticDiagnostics(server, service, fileName, uri) {
    const tsDiagnostics = service.getSemanticDiagnostics(fileName);
    const diagnostics = tsDiagnostics.map((error) => toFullDiagnostic(error));
    server.connection.sendDiagnostics({ uri, diagnostics });
}
exports.getFullSemanticDiagnostics = getFullSemanticDiagnostics;
function getSemanticDiagnostics(server, service, templateRange, fileName, focusPath, uri) {
    //  console.log(service.getSyntacticDiagnostics(fileName).map((el)=>{
    //     console.log('getSyntacticDiagnostics', el.messageText, el.start, el.length);
    // }));
    // console.log('getSemanticDiagnostics', fileName);
    const tsDiagnostics = service.getSemanticDiagnostics(fileName);
    const diagnostics = tsDiagnostics.map((error) => toDiagnostic(error, templateRange, focusPath));
    server.connection.sendDiagnostics({ uri, diagnostics });
    // console.log(service.getSemanticDiagnostics(fileName).map((el)=>{
    // const diagnostics: Diagnostic[] = errors.map((error: any) => toDiagnostic(el));
    // server.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    // console.log('getSemanticDiagnostics', el.messageText, el.start, el.length);
    // }));
    // console.log(service.getSuggestionDiagnostics(fileName).map((el)=>{
    //     console.log('getSuggestionDiagnostics', el.messageText, el.start, el.length);
    // }));
    // console.log('getCompilerOptionsDiagnostics', service.getCompilerOptionsDiagnostics());
}
exports.getSemanticDiagnostics = getSemanticDiagnostics;
function toDiagnostic(err, [startIndex, endIndex], focusPath) {
    let errText = err.file.text.slice(err.start, err.start + err.length);
    if ((err.start >= startIndex && err.length + err.start <= endIndex) ||
        errText.startsWith("return ")) {
        let loc = focusPath.node.loc;
        return {
            severity: vscode_languageserver_1.DiagnosticSeverity.Error,
            range: loc
                ? vscode_languageserver_1.Range.create(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column)
                : vscode_languageserver_1.Range.create(0, 0, 0, 0),
            message: err.messageText,
            source: "typed-templates"
        };
    }
    else {
        return {
            severity: vscode_languageserver_1.DiagnosticSeverity.Error,
            range: offsetToRange(0, 0, ""),
            message: err.messageText,
            source: "typed-templates"
        };
    }
}
exports.toDiagnostic = toDiagnostic;
//# sourceMappingURL=ls-utils.js.map