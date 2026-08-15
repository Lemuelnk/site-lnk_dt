
(() => {
  const form = document.querySelector('#project-brief-form');
  if (!form) return;

  const status = document.querySelector('#brief-status');
  const submit = form.querySelector('button[type="submit"]');


  const attachmentInput = document.getElementById('brief-attachment');
  const fileName = document.getElementById('brief-file-name');

  attachmentInput?.addEventListener('change', () => {
    const file = attachmentInput.files?.[0];
    if (!file) {
      if (fileName) fileName.textContent = 'Aucun fichier sélectionné.';
      return;
    }
    if (fileName) fileName.textContent = `Fichier sélectionné : ${file.name} — ${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    const fileButton = form.querySelector('.file-select-button > span:last-child');
    if (fileButton) fileButton.textContent = 'Modifier la pièce jointe';
  });

  const requiredFields = [
    { id: 'brief-name', label: 'Nom / entreprise' },
    { id: 'brief-phone', label: 'Téléphone / WhatsApp' },
    { id: 'brief-email', label: 'Email' },
    { id: 'brief-client-type', label: 'Type de client' },
    { id: 'brief-project-type', label: 'Type de projet' },
    { id: 'brief-description', label: 'Description du projet' }
  ];

  function setError(field, message) {
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    field.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = message;
  }

  function clearError(field) {
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    field.removeAttribute('aria-invalid');
    if (error) error.textContent = '';
  }

  function validate() {
    let valid = true;
    let firstInvalid = null;

    requiredFields.forEach(({id, label}) => {
      const field = document.getElementById(id);
      if (!field) return;
      clearError(field);
      if (!field.value.trim()) {
        setError(field, `${label} est requis.`);
        valid = false;
        firstInvalid ||= field;
      }
    });

    const email = document.getElementById('brief-email');
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError(email, 'Veuillez saisir une adresse email valide.');
      valid = false;
      firstInvalid ||= email;
    }

    if (!valid) firstInvalid?.focus();
    return valid;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    status.className = 'brief-status';

    if (!validate()) {
      status.textContent = 'Veuillez vérifier les champs indiqués.';
      status.classList.add('error');
      return;
    }

    submit.disabled = true;
    submit.querySelector('span').textContent = 'Envoi…';

    try {
      const attachment = document.getElementById('brief-attachment');
      if (attachment?.files?.[0] && attachment.files[0].size > 10 * 1024 * 1024) {
        throw new Error('attachment-too-large');
      }

      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Form submission failed');

      form.reset();
      if (fileName) fileName.textContent = 'Aucun fichier sélectionné.';
      const fileButton = form.querySelector('.file-select-button > span:last-child');
      if (fileButton) fileButton.textContent = 'Ajouter une pièce jointe';
      form.querySelectorAll('[aria-invalid="true"]').forEach(field => clearError(field));
      status.textContent = 'Merci. Votre brief a bien été envoyé.';
      status.classList.add('success');
    } catch (error) {
      status.textContent = error.message === 'attachment-too-large'
        ? 'La pièce jointe dépasse 10 Mo. Merci de choisir un fichier plus léger ou de nous l’envoyer sur WhatsApp.'
        : 'L’envoi n’a pas pu être confirmé. Vous pouvez aussi nous écrire directement sur WhatsApp.';
      status.classList.add('error');
    } finally {
      submit.disabled = false;
      submit.querySelector('span').textContent = 'Envoyer le brief';
    }
  });
})();
