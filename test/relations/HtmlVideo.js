/*global describe, it*/
const expect = require('../unexpected-with-plugins');
const _ = require('lodash');
const AssetGraph = require('../../lib/AssetGraph');

describe('relations/HtmlVideo', function () {
    it('should handle a test case with existing <video> tags', async function () {
        const assetGraph = new AssetGraph({root: __dirname + '/../../testdata/relations/HtmlVideo/'});
        await assetGraph.loadAssets('index.html')
            .populate({
                followRelations: () => false
            });

        expect(assetGraph, 'to contain relations', 'HtmlVideo', 4);
        expect(assetGraph, 'to contain relations', 'HtmlVideoPoster', 2);

        assetGraph.findAssets({type: 'Html'})[0].url = 'http://example.com/foo/bar.html';
        assetGraph.findRelations().forEach(function (relation) {
            relation.hrefType = 'relative';
        });

        expect(_.map(assetGraph.findRelations(), 'href'), 'to equal', [
            '../movie1.mp4',
            '../movie1.jpg',
            '../movie2.png',
            '../movie2.mov',
            '../movie2.wmv',
            '../movie2.flc'
        ]);
    });
});
