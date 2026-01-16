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
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var sharp_1 = require("sharp");
// Dossiers à adapter
var INPUT_DIR = path_1.default.join(process.cwd(), 'public/images'); // images originales
var OUTPUT_DIR = path_1.default.join(process.cwd(), 'public/images/thumb'); // miniatures
var JSON_PATH = path_1.default.join(process.cwd(), 'data/products.json'); // ton JSON produits
// Crée le dossier thumb si inexistant
if (!fs_1.default.existsSync(OUTPUT_DIR))
    fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
// Charge le JSON
var products = JSON.parse(fs_1.default.readFileSync(JSON_PATH, 'utf-8'));
// Fonction pour créer la miniature
function createThumbnail(inputFile, outputFile) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sharp_1.default)(inputFile)
                        .resize(300) // largeur max 300px
                        .jpeg({ quality: 60 }) // compression JPEG
                        .toFile(outputFile)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, products_1, product, imageName, inputPath, outputPath, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, products_1 = products;
                    _a.label = 1;
                case 1:
                    if (!(_i < products_1.length)) return [3 /*break*/, 6];
                    product = products_1[_i];
                    imageName = path_1.default.basename(product.image);
                    inputPath = path_1.default.join(INPUT_DIR, imageName);
                    outputPath = path_1.default.join(OUTPUT_DIR, imageName);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    // Crée la miniature
                    return [4 /*yield*/, createThumbnail(inputPath, outputPath)];
                case 3:
                    // Crée la miniature
                    _a.sent();
                    // Ajoute la nouvelle propriété imageThumbnail
                    product.imageThumbnail = "/images/thumb/".concat(imageName);
                    // Optionnel : garder l'image full-size cohérente
                    product.image = "/images/".concat(imageName);
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Erreur pour ".concat(product.id, " :"), err_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    // Écrit le JSON mis à jour
                    fs_1.default.writeFileSync(JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
                    console.log('✅ Miniatures générées et JSON mis à jour');
                    return [2 /*return*/];
            }
        });
    });
}
main();
