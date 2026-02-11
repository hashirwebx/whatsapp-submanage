
import re
import os

def fix_jsx_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix < section to <section
    content = re.sub(r'<\s+section', '<section', content)
    # Fix </section > to </section>
    content = re.sub(r'</section\s+>', '</section>', content)
    # Fix </div > to </div>
    content = re.sub(r'</div\s+>', '</div>', content)
    # Fix </footer > to </footer>
    content = re.sub(r'</footer\s+>', '</footer>', content)
    # Fix className = to className=
    content = re.sub(r'className\s+=\s+', 'className=', content)
    # Fix comments like {/* Hero Section */ } to {/* Hero Section */}
    content = content.replace('*/ }', '*/}')
    
    # Specific fix for line 165 style error if it exists
    content = content.replace('< section className =', '<section className=')
    content = content.replace('</nav >', '</nav>')
    content = content.replace('</footer >', '</footer>')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

file_path = r"d:\make a real world project\Hashir-Whatsappsubscriptionmanagementsystem-main\New Whatsappsubscriptionmanagementsystem\src\components\LandingPage.tsx"
fix_jsx_syntax(file_path)
print("Fixed JSX syntax errors in LandingPage.tsx")
