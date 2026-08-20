#!/usr/bin/env python3
"""Replace the project brief form on index.html with a CTA that redirects to contact.html"""
import re

content = open('index.html', encoding='utf-8').read()

# Find the contact section start
start_marker = '<section id="contact" class="contact-section lnk-reveal" aria-labelledby="contact-title">'
start_idx = content.index(start_marker)

# Find the end - the section ends before <!-- STEP 7
end_search = '</section>'
# Find the last </section> before STEP 7
testimonials_idx = content.index('<!-- STEP 7', start_idx)
end_idx = content.rindex('</section>', start_idx, testimonials_idx) + len('</section>')

cta_html = '''<section id="contact" class="contact-section lnk-reveal" aria-labelledby="contact-title">
  <div class="container">
    <div class="contact-intro">
      <p class="eyebrow">06 / LET'S TALK</p>
      <h2 id="contact-title">Parlons de<br><span>votre projet.</span></h2>
      <p class="contact-lead">
        Une idée, un besoin visuel ou un projet à matérialiser ?
        Partagez-nous l'essentiel. Nous reviendrons vers vous avec les prochaines étapes.
      </p>
    </div>
    <div class="contact-cta-block">
      <div class="contact-direct">
        <div class="contact-direct-block">
          <p class="contact-label">EMAIL</p>
          <a href="mailto:contact@lnk-studio.com">contact@lnk-studio.com</a>
        </div>
        <div class="contact-direct-block">
          <p class="contact-label">WHATSAPP</p>
          <a href="https://wa.me/243998222431" target="_blank" rel="noopener noreferrer"
             aria-label="Écrire à LNK Design Touch sur WhatsApp">
            <svg class="contact-icon icon-whatsapp" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M20.5 3.5A11.86 11.86 0 0 0 12.05 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.13 1.6 5.93L.06 24l6.34-1.66a11.86 11.86 0 0 0 5.65 1.43h.01c6.54 0 11.86-5.32 11.86-11.87a11.8 11.8 0 0 0-3.42-8.4Zm-8.45 18.25h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.98 1-3.66-.23-.38a9.86 9.86 0 1 1 8.39 4.65Zm5.41-7.39c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.69.15-.2.3-.79.97-.97 1.17-.18.2-.36.23-.66.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.18-.3-.02-.46.13-.61.13-.13.3-.36
.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.69-1.66-.94-2.27-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.53.08-.81.38-.28.3-1.06 1.04-1.06 2.55s1.09 2.96 1.24 3.16c.15.2 2.14 3.27 5.19 4.58.73.32 1.3.51 1.74.65.73.23 1.4.2 1.93.12.59-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.18-1.41-.08-.13-.28-.2-.59-.36Z"/>
            </svg>
            <span>Écrire sur WhatsApp</span>
          </a>
        </div>
        <div class="contact-direct-block">
          <p class="contact-label">LOCALISATION</p>
          <p>Lubumbashi, DRC</p>
          <small>Design graphique à distance. Impression disponible bientôt.</small>
        </div>
        <div class="contact-direct-mark" aria-hidden="true">
          <span>LNK</span>
          <span>DT</span>
        </div>
      </div>
      <div class="contact-cta-actions">
        <a class="contact-cta-primary" href="contact.html" data-lang-fr="Demander un devis ou poser une question" data-lang-en="Request a quote or ask a question">
          <span>Demander un devis ou poser une question</span>
          <svg class="contact-icon icon-arrow" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a class="contact-cta-secondary" href="devis.html" data-lang-fr="Estimer le coût de votre projet" data-lang-en="Estimate your project cost">
          <span>Estimer le coût de votre projet</span>
        </a>
      </div>
    </div>
  </div>
</section>'''

content = content[:start_idx] + cta_html + content[end_idx:]

open('index.html', 'w', encoding='utf-8').write(content)
print("Replaced contact section with CTA")
