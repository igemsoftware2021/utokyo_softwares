# Hexogem

## Setup

Insert `hexogem.js` file to your `scripts/` folder of the hexo project.
Instructions on `scripts/` folder is found in the [Hexo Documentation](https://hexo.io/docs/plugins.html).

In order to use our modified iGEM-WikiSync, copy the `wikisync.py` file.
In the file, original version of iGEM-WikiSync is partially used. Thus, you have to install WikiSync if you have not.

```
$ pip3 install igem-wikisync
```

## How to use

1. Local testing in the similar environment to iGEM server

Instead of the normal testing command `hexo server`, you have to use the command below.

```
$ hexo server --wiki
```

2. Generate a site with MediaWiki Templates

```
$ hexo generate --wiki
```

3. Upload the generated site with WikiSync (fix the config in the file and set the environment variables referred to in the [iGEM-WikiSync documantation](https://igem-wikisync.readthedocs.io/en/latest/tutorial/index.html))

```
$ python wikisync.py
```

