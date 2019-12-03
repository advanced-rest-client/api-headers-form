module.exports = {
  watch: true,
  open: true,
  nodeResolve: true,
  appIndex: 'demo/index.html',
  moduleDirs: ['node_modules'],
  responseTransformers: [
    function rewriteBasePath({ url, status, contentType, body }) {
      if (url === '/node_modules/marked/lib/marked.js') {
        const rewritten = body.replace('(this || (', '(window || (');
        return { body: rewritten };
      }
    },
  ],
  compatibility: 'auto'
};
