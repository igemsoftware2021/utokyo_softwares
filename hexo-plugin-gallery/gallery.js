let globalId = 0
hexo.extend.tag.register('gallery', (args, content) => {
  const id = `gallery-${globalId}`
  globalId++
  let exportText = `<section class="gallery" id="${id}">`
  const options = JSON.parse(content)
  let i = 0
  for (let person of options) {
    i++
    exportText += `
<div class="gallery-item">
  <img src="${person.path}" />
  <h3>${person.name}</h3>
  <p class="profile-bio">
    ${person.comment}
  </p>
</div>
    `
  }
  exportText += `
</section>
  `
  return exportText
}, { ends: true })
