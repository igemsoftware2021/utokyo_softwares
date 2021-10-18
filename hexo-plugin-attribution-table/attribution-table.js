hexo.extend.tag.register('attribution', (args, content) => {
  const { columns, members } = JSON.parse(content)
  let exportText = '<table class="attribution-table"><thead><tr><th></th>'
  for (let column of columns) {
    exportText += `<th>${column}</th>`
  }
  exportText += '</tr></thead><tbody>'
  for (let [memberName, roles] of Object.entries(members)) {
    exportText += `<tr><td>${memberName}</td>`
    for (let column of columns) {
      let content = ''
      if (roles.includes(column)) {
        content = '●'
      }
      exportText += `<td>${content}</td>`
    }
    exportText += '</tr>'
  }
  exportText += '</tbody></table>'
  return exportText
}, { ends: true })
