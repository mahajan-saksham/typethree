"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config(); // Look for .env in the current working directory
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the .env file');
    process.exit(1);
}
// Initialize Supabase client with Service Role Key
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        // Important: Use service key for admin operations
        persistSession: false,
        autoRefreshToken: false,
    },
});
function setInitialDefaults() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, productsToUpdate, findError, updatedCount, _i, _b, product, _c, variants, variantError, firstVariant, updateSkuError, updateVariantError, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('Starting script to set initial default variants...');
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, supabase
                            .from('product_skus')
                            .select('id, name, default_variant_id')
                            .is('default_variant_id', null)];
                case 2:
                    _a = _d.sent(), productsToUpdate = _a.data, findError = _a.error;
                    if (findError) {
                        console.error('Error finding products:', findError.message);
                        return [2 /*return*/];
                    }
                    if (!productsToUpdate || productsToUpdate.length === 0) {
                        console.log('All products already have a default variant set.');
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat(productsToUpdate.length, " products needing a default variant."));
                    updatedCount = 0;
                    _i = 0, _b = productsToUpdate;
                    _d.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    product = _b[_i];
                    console.log("Processing product: ".concat(product.name, " (ID: ").concat(product.id, ")"));
                    return [4 /*yield*/, supabase
                            .from('product_variants')
                            .select('id, product_id, is_default')
                            .eq('product_id', product.id)
                            .limit(1)];
                case 4:
                    _c = _d.sent(), variants = _c.data, variantError = _c.error;
                    if (variantError) {
                        console.error("  Error fetching variants for product ".concat(product.id, ":"), variantError.message);
                        return [3 /*break*/, 7]; // Skip to next product
                    }
                    if (!variants || variants.length === 0) {
                        console.warn("  No variants found for product ".concat(product.id, ". Skipping."));
                        return [3 /*break*/, 7]; // Skip to next product
                    }
                    firstVariant = variants[0];
                    console.log("  Found first variant: ".concat(firstVariant.id));
                    return [4 /*yield*/, supabase
                            .from('product_skus')
                            .update({ default_variant_id: firstVariant.id })
                            .eq('id', product.id)];
                case 5:
                    updateSkuError = (_d.sent()).error;
                    if (updateSkuError) {
                        console.error("  Error updating product_sku ".concat(product.id, ":"), updateSkuError.message);
                        return [3 /*break*/, 7]; // Skip to next product
                    }
                    return [4 /*yield*/, supabase
                            .from('product_variants')
                            .update({ is_default: true })
                            .eq('id', firstVariant.id)];
                case 6:
                    updateVariantError = (_d.sent()).error;
                    if (updateVariantError) {
                        console.error("  Error updating variant ".concat(firstVariant.id, ":"), updateVariantError.message);
                        // Note: Sku was updated, but variant wasn't. Might need manual correction.
                        return [3 /*break*/, 7]; // Skip to next product
                    }
                    console.log("  Successfully set variant ".concat(firstVariant.id, " as default for product ").concat(product.id, "."));
                    updatedCount++;
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    console.log("Finished processing. Successfully updated ".concat(updatedCount, " products."));
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _d.sent();
                    console.error('An unexpected error occurred:', error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
setInitialDefaults();
