from igem_wikisync import wikisync as sync
from igem_wikisync.logger import logger
import os
import sys
from hashlib import md5

config = {
    'team':      'UTokyo', # change the team name!
    'src_dir':   'public/',
    'build_dir': 'build/',
    'year': '2021',
    'silence_warnings': False,
    'poster_mode': False
}

# Our version of html uploading function!
# This supports MediaWiki Templates.
def upload_html(html_files, browser, config, upload_map):
  for path in html_files.keys():
    file_object = html_files[path]
    path_str = str(file_object.path)
    ext = file_object.extension

    # open file
    try:
        with open(file_object.src_path, 'r', encoding='utf-8') as file:
            contents = file.read()
    except Exception:
        message = f'Could not open/read {file_object.path}. Skipping.'
        print(message)
        # logger.error(message)
        continue  # FIXME Can this be improved?

    preprocess = '' + contents + ''
    preprocess = preprocess.replace('&#123;', '<!-- replace point -->{<!-- /replace point -->')
    preprocess = preprocess.replace('&#125;', '<!-- replace point -->}<!-- /replace point -->')
    # parse and modify contents
    processed = sync.HTMLparser(
        config, file_object.path, preprocess, upload_map)
    processed = processed.replace('<!-- replace point -->{<!-- /replace point -->', '&#123;')
    processed = processed.replace('<!-- replace point -->}<!-- /replace point -->', '&#125;')
    processed = processed.replace('{{', '</html>{{').replace('}}', '}}<html>')

    # calculate and store md5 hash of the modified contents
    build_hash = md5(processed.encode('utf-8')).hexdigest()

    if upload_map[ext][path_str]['md5'] == build_hash:
        message = f'Contents of {file_object.path} have been uploaded previously. Skipping.'
        print(message)
        logger.info(message)
    else:
        upload_map[ext][path_str]['md5'] = build_hash
        build_path = file_object.build_path
        try:
            # create directory if doesn't exist
            if not os.path.isdir(build_path.parent):
                os.makedirs(build_path.parent)
            # and write the processed contents
            with open(build_path, 'w', encoding='utf-8') as file:
                file.write(processed)
        except Exception:
            message = f"Couldn not write {str(file_object.build_path)}. Skipping."
            print(message)
            logger.error(message)
            continue
            # FIXME Can this be improved?

        # upload
        successful = sync.iGEM_upload_page(browser, processed, file_object.upload_URL)
        if not successful:
            message = f'Could not upload {str(file_object.path)}. Skipping.'
            print(message)
            logger.error(message)
            continue
            # FIXME Can this be improved?
        else:
            pass
            # counter[ext] += 1

build_dir = config['build_dir']

# * 2. Load or create upload_map
upload_map = sync.get_upload_map()

# * 3. Create build directory
if not os.path.isdir(build_dir):
    os.mkdir(build_dir)
    # ? error handling here?

# * 4. Get iGEM credentials from environment variables
credentials = {
    'username': os.environ.get('IGEM_USERNAME'),
    'password': os.environ.get('IGEM_PASSWORD')
}

# * 5. Load/create cookie file
browser, cookiejar = sync.get_browser_with_cookies()

# * 6. Login to iGEM
login = sync.iGEM_login(browser, credentials, config)
if not login:
    message = 'Failed to login.'
    # logger.critical(message)
    sys.exit(2)

# # * 7. Save cookies
# # TODO: check if this works, might not
# cookiejar.save()

# * 8. Cache files
files = sync.cache_files(upload_map, config)

# * 9. Upload all assets and create a map
uploaded_assets = sync.upload_and_write_assets(files['other'], browser, upload_map, config)

# Our original implementation.
# If files are in `/template` directory, then uploaded to Template:<Team Name>.
for path in files['html'].keys():
    html_file = files['html'][path]
    if html_file._upload_path.startswith('/template/'):
        upload_map['html'][str(path)]['link_URL'] =  f'''https://{config['year']}.igem.org/Template:{config['team']}{html_file._upload_path}'''
        files['html'][path]._upload_URL = f'''https://{config['year']}.igem.org/wiki/index.php?title=Template:{config['team']}{html_file._upload_path}&action=edit'''

# * 10. write upload map just in case
# things go wrong while dealing with code
sync.write_upload_map(upload_map)

# * 11. Build files and upload changed files
# UTokyo modification: only dealing with css and js files
uploaded_code = sync.build_and_upload({
  'html': {},
  'css': files['css'],
  'js': files['js']
}, browser, config, upload_map)

# UTokyo modification: here, deals with html files in our version of the function
uploaded_code_html = upload_html(files['html'], browser, config, upload_map)

# * 12. Write final upload map
sync.write_upload_map(upload_map)

sync.print_summary(uploaded_assets, uploaded_code)
