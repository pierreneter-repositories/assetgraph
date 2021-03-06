/*global describe, it*/
var expect = require('../unexpected-with-plugins'),
    AssetGraph = require('../../lib/AssetGraph');

describe('relations/HtmlIFrameSrcDoc', function () {
    it('should handle a test case with an existing <iframe srcdoc=...> element', async function () {
        const assetGraph = new AssetGraph({root: __dirname + '/../../testdata/relations/HtmlIFrameSrcDoc/'});

        await assetGraph
            .loadAssets('index.html')
            .populate({
                followRelations: {to: {url: /^file:/}}
            });

        expect(assetGraph, 'to contain assets', 'Html', 3);
        expect(assetGraph, 'to contain asset', {type: 'Html', isInline: true});
        expect(assetGraph, 'to contain relation', 'HtmlIFrame');
        expect(assetGraph, 'to contain relation', 'HtmlIFrameSrcDoc');
        expect(assetGraph, 'to contain relations', 'HtmlAnchor', 2);

        const asset = assetGraph.findRelations({type: 'HtmlIFrameSrcDoc'})[0].to;
        const document = asset.parseTree;
        document.firstChild.appendChild(document.createTextNode('Hello from the outside!'));
        asset.markDirty();

        expect(assetGraph.findAssets({url: /\/index\.html$/})[0].text, 'to match', /Hello from the outside!/);
    });
});
