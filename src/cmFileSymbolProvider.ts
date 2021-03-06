'use strict';

import * as vscode from 'vscode';

const path = require("path");

import {TextDocument, CancellationToken, ProviderResult} from 'vscode';

export class CMFileSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument, token: CancellationToken): ProviderResult<vscode.SymbolInformation[]> {
        let symbols: vscode.SymbolInformation[] = [];

        const searches = [
            { regex: /\b(?:public|package|private)\s+class\s+([a-zA-Z][_a-zA-Z0-9]*)/g, kind: vscode.SymbolKind.Class },
            { regex: /(?:extend\s+)?(?:public|package|private)\s+([a-zA-Z](?:[_\-\>a-zA-Z0-9]|\{\}|\[\])*)\s+([a-zA-Z][_a-zA-Z0-9]*)\s*\(.*(?=\)\s*\{.*)/g, kind: vscode.SymbolKind.Method },
            { regex: /(?:public|package|private)\s+([a-zA-Z](?:[_\-\>a-zA-Z0-9]|\{\}|\[\])*)\s+([a-zA-Z][_a-zA-Z0-9]*)[^{]*?(?=;)/g, kind: vscode.SymbolKind.Property }
        ];

        searches.forEach( s => {
            const txt = document.getText();
            var match: RegExpExecArray;
            while( ( match = s.regex.exec(txt) ) !== null ) {
                symbols.push( new vscode.SymbolInformation(
                        this.getNameFromKind( match, s.kind ),
                        s.kind,
                        document.fileName,
                        new vscode.Location(
                            document.uri,
                            document.positionAt( match.index )
                        )
                    )
                );
            } 
        });

        return Promise.resolve(symbols);
    }

    private getNameFromKind( match: RegExpExecArray, kind: vscode.SymbolKind ): string {
        if ( kind == vscode.SymbolKind.Class ) {
            return match[1];
        } else if ( kind == vscode.SymbolKind.Method ) {
            return `${match[2]}() : ${match[1]}`;
        } else if ( kind == vscode.SymbolKind.Property ) {
            return `${match[2]} : ${match[1]}`;
        }
    }
/*
    public resolveWorkspaceSymbol(symbol: SymbolInformation, token: CancellationToken): ProviderResult {

    }
    */
}