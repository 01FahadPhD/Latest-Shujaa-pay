/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/contexts/LayoutContext.jsx":
/*!****************************************!*\
  !*** ./src/contexts/LayoutContext.jsx ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   LayoutProvider: () => (/* binding */ LayoutProvider),\n/* harmony export */   useLayout: () => (/* binding */ useLayout)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst LayoutContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nconst useLayout = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(LayoutContext);\n    if (!context) {\n        throw new Error(\"useLayout must be used within a LayoutProvider\");\n    }\n    return context;\n};\nconst LayoutProvider = ({ children })=>{\n    const [sidebarOpen, setSidebarOpen] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const toggleSidebar = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(()=>{\n        setSidebarOpen((prev)=>!prev);\n    }, []);\n    const openSidebar = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(()=>{\n        setSidebarOpen(true);\n    }, []);\n    const closeSidebar = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(()=>{\n        setSidebarOpen(false);\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(LayoutContext.Provider, {\n        value: {\n            sidebarOpen,\n            toggleSidebar,\n            openSidebar,\n            closeSidebar\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Fahad Amour (PHD)\\\\shujaa-pay\\\\src\\\\contexts\\\\LayoutContext.jsx\",\n        lineNumber: 29,\n        columnNumber: 5\n    }, undefined);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29udGV4dHMvTGF5b3V0Q29udGV4dC5qc3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFnRjtBQUVoRixNQUFNSyw4QkFBZ0JKLG9EQUFhQTtBQUU1QixNQUFNSyxZQUFZO0lBQ3ZCLE1BQU1DLFVBQVVMLGlEQUFVQSxDQUFDRztJQUMzQixJQUFJLENBQUNFLFNBQVM7UUFDWixNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFDQSxPQUFPRDtBQUNULEVBQUU7QUFFSyxNQUFNRSxpQkFBaUIsQ0FBQyxFQUFFQyxRQUFRLEVBQUU7SUFDekMsTUFBTSxDQUFDQyxhQUFhQyxlQUFlLEdBQUdULCtDQUFRQSxDQUFDO0lBRS9DLE1BQU1VLGdCQUFnQlQsa0RBQVdBLENBQUM7UUFDaENRLGVBQWVFLENBQUFBLE9BQVEsQ0FBQ0E7SUFDMUIsR0FBRyxFQUFFO0lBRUwsTUFBTUMsY0FBY1gsa0RBQVdBLENBQUM7UUFDOUJRLGVBQWU7SUFDakIsR0FBRyxFQUFFO0lBRUwsTUFBTUksZUFBZVosa0RBQVdBLENBQUM7UUFDL0JRLGVBQWU7SUFDakIsR0FBRyxFQUFFO0lBRUwscUJBQ0UsOERBQUNQLGNBQWNZLFFBQVE7UUFBQ0MsT0FBTztZQUM3QlA7WUFDQUU7WUFDQUU7WUFDQUM7UUFDRjtrQkFDR047Ozs7OztBQUdQLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaHVqYWEtcGF5Ly4vc3JjL2NvbnRleHRzL0xheW91dENvbnRleHQuanN4PzQzYjMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcclxuXHJcbmNvbnN0IExheW91dENvbnRleHQgPSBjcmVhdGVDb250ZXh0KCk7XHJcblxyXG5leHBvcnQgY29uc3QgdXNlTGF5b3V0ID0gKCkgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KExheW91dENvbnRleHQpO1xyXG4gIGlmICghY29udGV4dCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VMYXlvdXQgbXVzdCBiZSB1c2VkIHdpdGhpbiBhIExheW91dFByb3ZpZGVyJyk7XHJcbiAgfVxyXG4gIHJldHVybiBjb250ZXh0O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IExheW91dFByb3ZpZGVyID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IFtzaWRlYmFyT3Blbiwgc2V0U2lkZWJhck9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xyXG5cclxuICBjb25zdCB0b2dnbGVTaWRlYmFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgc2V0U2lkZWJhck9wZW4ocHJldiA9PiAhcHJldik7XHJcbiAgfSwgW10pO1xyXG5cclxuICBjb25zdCBvcGVuU2lkZWJhciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIHNldFNpZGViYXJPcGVuKHRydWUpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3QgY2xvc2VTaWRlYmFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgc2V0U2lkZWJhck9wZW4oZmFsc2UpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxMYXlvdXRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7XHJcbiAgICAgIHNpZGViYXJPcGVuLFxyXG4gICAgICB0b2dnbGVTaWRlYmFyLFxyXG4gICAgICBvcGVuU2lkZWJhcixcclxuICAgICAgY2xvc2VTaWRlYmFyXHJcbiAgICB9fT5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9MYXlvdXRDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn07Il0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VTdGF0ZSIsInVzZUNhbGxiYWNrIiwiTGF5b3V0Q29udGV4dCIsInVzZUxheW91dCIsImNvbnRleHQiLCJFcnJvciIsIkxheW91dFByb3ZpZGVyIiwiY2hpbGRyZW4iLCJzaWRlYmFyT3BlbiIsInNldFNpZGViYXJPcGVuIiwidG9nZ2xlU2lkZWJhciIsInByZXYiLCJvcGVuU2lkZWJhciIsImNsb3NlU2lkZWJhciIsIlByb3ZpZGVyIiwidmFsdWUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/contexts/LayoutContext.jsx\n");

/***/ }),

/***/ "./src/pages/_app.jsx":
/*!****************************!*\
  !*** ./src/pages/_app.jsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_LayoutContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/LayoutContext */ \"./src/contexts/LayoutContext.jsx\");\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_LayoutContext__WEBPACK_IMPORTED_MODULE_2__.LayoutProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Fahad Amour (PHD)\\\\shujaa-pay\\\\src\\\\pages\\\\_app.jsx\",\n            lineNumber: 7,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Fahad Amour (PHD)\\\\shujaa-pay\\\\src\\\\pages\\\\_app.jsx\",\n        lineNumber: 6,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC5qc3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUErQjtBQUM0QjtBQUUzRCxTQUFTQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3JDLHFCQUNFLDhEQUFDSCxtRUFBY0E7a0JBQ2IsNEVBQUNFO1lBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7QUFHOUI7QUFFQSxpRUFBZUYsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3NodWphYS1wYXkvLi9zcmMvcGFnZXMvX2FwcC5qc3g/NGM3NyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XHJcbmltcG9ydCB7IExheW91dFByb3ZpZGVyIH0gZnJvbSAnLi4vY29udGV4dHMvTGF5b3V0Q29udGV4dCc7XHJcblxyXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcclxuICByZXR1cm4gKFxyXG4gICAgPExheW91dFByb3ZpZGVyPlxyXG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XHJcbiAgICA8L0xheW91dFByb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwOyJdLCJuYW1lcyI6WyJMYXlvdXRQcm92aWRlciIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/_app.jsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/_app.jsx"));
module.exports = __webpack_exports__;

})();