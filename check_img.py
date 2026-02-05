import os
import re
from pathlib import Path

# --- 全局变量定义 ---
SITE_DIR = "_site"  # Jekyll 默认生成的静态目录
IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')

def check_image_links(site_root):
    """
    优雅地检查 _site 目录下所有 HTML 文件中的图片链接有效性
    """
    if not os.path.exists(site_root):
        print(f"错误: 找不到目录 {site_root}。请先运行 'bundle exec jekyll build'。")
        return

    missing_assets = []
    html_files = list(Path(site_root).rglob("*.html"))

    # 匹配 img 标签的 src 属性
    img_regex = re.compile(r'<img [^>]*src="([^"]+)"', re.IGNORECASE)

    for html_path in html_files:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
            links = img_regex.findall(content)
            
            for link in links:
                # 忽略外部链接
                if link.startswith(('http', 'https', '//')):
                    continue
                
                # 处理绝对路径与相对路径的转换
                clean_link = link.lstrip('/')
                target_path = Path(site_root) / clean_link

                if not target_path.exists():
                    missing_assets.append((str(html_path), link))

    _report_results(missing_assets)

def _report_results(missing_list):
    """格式化报告输出"""
    if not missing_list:
        print("✅ 太棒了！所有本地图片链接均有效。")
    else:
        print(f"❌ 发现 {len(missing_list)} 处异常引用：")
        print("-" * 50)
        for source, link in missing_list:
            print(f"文件: {source}\n丢失路径: {link}\n")
        print("-" * 50)
        print("💡 建议：如果丢失路径以 'LSTM_img' 开头，说明 Jekyll 没把该文件夹搬运到 _site。")

if __name__ == "__main__":
    check_image_links(SITE_DIR)