// Load modules

var Dust;

// Declare internals

var internals = {};


internals.render = function (tmpl) {

    return function (context, options, callback) {

        if (options.streaming) {

            try {
                var stream = tmpl(context);
            } catch (err) {
                return callback(err, null);
            }

            return callback(null, stream);
        }

        return tmpl(context, callback);
    };
};

// Declare externals
var externals = {};


// Declare module

externals.module = {};


externals.module.compile = function (template, options, callback) {

    try {
        var tmpl = Dust.compileFn(template, options.filename);
    } catch (err) {
        return callback(err, null);
    }

    var renderFn = internals.render(tmpl);

    return callback(null, renderFn);
};

externals.module.prepare = function (config, next) {

    var err = null;

    if (config.compileMode !== 'async') {
        err = new Error('compileMode must be async for hapi-Dust');
    }

    next(err);
};

externals.module.registerPartial = function (name, src) {

    var tmpl = Dust.compileFn(src, name);
};

externals.module.registerHelper = function (name, helper) {

    if (helper.length > 1) {
        Dust.helpers[name] = helper;
    } else {
        Dust.filters[name] = helper;
    }
};

// Set defaults


externals.compileMode = 'async';


// Factory

exports = module.exports = function (config) {

    config = config || {};

    if (config.dust) {
        Dust = config.dust;
    } else if (config.loadHelpers) {
        Dust = require('dustjs-helpers');
    } else {
        Dust = require('dustjs-linkedin');
    }

    return externals;
};
