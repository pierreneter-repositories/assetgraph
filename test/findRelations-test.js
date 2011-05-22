var vows = require('vows'),
    assert = require('assert'),
    AssetGraph = require('../lib/AssetGraph'),
    assets = AssetGraph.assets,
    relations = AssetGraph.relations,
    transforms = AssetGraph.transforms,
    query = AssetGraph.query;

vows.describe('AssetGraph.findAssets').addBatch({
    'Load test case': {
        topic: function () {
            new AssetGraph().queue(
                transforms.loadAssets(
                    new assets.HTML({url: 'a', rawSrc: 'a', foo: 'bar'}),
                    new assets.HTML({url: 'b', rawSrc: 'b', foo: 'bar'}),
                    new assets.HTML({url: 'c', rawSrc: 'c', foo: 'quux'}),
                    new assets.CSS({url: 'd', rawSrc: 'd', foo: 'baz'}),
                    new assets.CSS({url: 'e', rawSrc: 'e'}),
                    new assets.PNG({url: 'f', rawSrc: 'f', foo: 'baz'})
                ),
                function (assetGraph, cb) {
                    assetGraph.addRelation(new relations.HTMLStyle({
                        from: assetGraph.findAssets({rawSrc: 'a'})[0],
                        to: assetGraph.findAssets({rawSrc: 'd'})[0]
                    }));
                    assetGraph.addRelation(new relations.HTMLAnchor({
                        from: assetGraph.findAssets({rawSrc: 'a'})[0],
                        to: assetGraph.findAssets({rawSrc: 'b'})[0]
                    }));
                    assetGraph.addRelation(new relations.HTMLAnchor({
                        from: assetGraph.findAssets({rawSrc: 'a'})[0],
                        to: assetGraph.findAssets({rawSrc: 'c'})[0]
                    }));
                    assetGraph.addRelation(new relations.HTMLAnchor({
                        from: assetGraph.findAssets({rawSrc: 'b'})[0],
                        to: assetGraph.findAssets({rawSrc: 'c'})[0]
                    }));
                    assetGraph.addRelation(new relations.HTMLStyle({
                        from: assetGraph.findAssets({rawSrc: 'b'})[0],
                        to: assetGraph.findAssets({rawSrc: 'e'})[0]
                    }));
                    assetGraph.addRelation(new relations.CSSImage({
                        from: assetGraph.findAssets({rawSrc: 'd'})[0],
                        to: assetGraph.findAssets({rawSrc: 'f'})[0]
                    }));
                    assetGraph.addRelation(new relations.CSSImage({
                        from: assetGraph.findAssets({rawSrc: 'e'})[0],
                        to: assetGraph.findAssets({rawSrc: 'f'})[0]
                    }));
                    process.nextTick(cb);
                }
            ).run(this.callback);
        },
        'and lookup relations by a single indexed property': function (assetGraph) {
            assert.equal(assetGraph.findRelations({type: 'CSSImage'}).length, 2);
        },
        'and lookup relations by multiple indexed properties': function (assetGraph) {
            assert.equal(assetGraph.findRelations({
                type: 'HTMLAnchor',
                from: assetGraph.findAssets({rawSrc: 'a'})[0]
            }).length, 2);
        },
        'and lookup relations by structured query': function (assetGraph) {
            assert.equal(assetGraph.findRelations({
                type: 'HTMLAnchor',
                to: {
                    rawSrc: 'c',
                    foo: 'quux'
                }
            }).length, 2);
        },
        'and lookup relations by structured query with arrays': function (assetGraph) {
            assert.equal(assetGraph.findRelations({
                type: ['HTMLAnchor', 'HTMLStyle'],
                from: {
                    rawSrc: ['a', 'b']
                },
                to: {
                    type: ['HTML', 'CSS']
                }
            }).length, 5);
        },
        'and lookup relations by structured query with regexps': function (assetGraph) {
            assert.equal(assetGraph.findRelations({
                type: /CSSIm|HTMLAn/,
                from: {
                    rawSrc: /^[ad]$/
                }
            }).length, 3);
            assert.equal(assetGraph.findRelations({
                type: /Style/,
                from: {
                    rawSrc: /^a$/
                }
            }).length, 1);
        },
        'and lookup relations by negative match': function (assetGraph) {
            assert.equal(assetGraph.findRelations({
                type: query.not('CSSImage'),
                from: {
                    rawSrc: query.not('a')
                }
            }).length, 2);
        },
        'and lookup relations using query.isDefined': function (assetGraph) {
            assert.equal(assetGraph.findRelations({
                from: {
                    foo: query.isDefined
                }
            }).length, 6);
            assert.equal(assetGraph.findRelations({
                from: {
                    foo: query.isUndefined
                }
            }).length, 1);
        }
    }
})['export'](module);
