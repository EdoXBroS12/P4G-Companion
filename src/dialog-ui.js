/** Dialog body only. The app owns the dialog title, focus, submission and validation. */
export function createBranchDialog({ e, rawEsc, profileName }) {
  const source = typeof profileName === 'string' && profileName.trim()
    ? `<strong class="dialog-profile-name" data-no-translate>${rawEsc(profileName)}</strong>`
    : `<strong class="dialog-profile-name">${e('Ramo attuale')}</strong>`;
  return `<form id="branch-form" class="branch-dialog" novalidate aria-describedby="branch-purpose">
    <p id="branch-purpose" class="dialog-purpose">${e('Un ramo è una copia del registro dell’app. Usalo per tenere separati i progressi associati a salvataggi diversi della partita.')}</p>
    <div class="dialog-source-card"><span class="dialog-source-icon" aria-hidden="true">⎘</span><div><span class="dialog-caption">${e('Copia da')}</span>${source}</div></div>
    <div class="dialog-field"><label for="new-profile-name">${e('Nome del nuovo ramo')}</label><input type="text" id="new-profile-name" name="branchName" maxlength="70" required autocomplete="off" aria-invalid="false" aria-describedby="branch-name-help branch-name-error" placeholder="${e('Es. Golden · dal 2 gennaio')}"><p id="branch-name-help" class="dialog-field-help">${e('Scegli un nome che ti aiuti a riconoscere il salvataggio che stai seguendo.')}</p><p id="branch-name-error" class="dialog-field-error" role="status" aria-live="polite" aria-atomic="true"></p></div>
    <details class="dialog-copy-summary"><summary>${e('Cosa viene copiato')}</summary><ul class="dialog-copy-list"><li>${e('Stato delle quest')}</li><li>${e('Spunte delle guide')}</li><li>${e('Appunti')}</li><li>${e('Lista di oggi')}</li><li>${e('Livelli delle Persona')}</li></ul><p class="dialog-shared-note">${e('I finali già visti restano comuni a tutti i rami.')}</p></details>
    <p class="dialog-game-note"><span aria-hidden="true">!</span><span>${e('Il gioco resta invariato: nessun salvataggio viene creato o caricato.')}</span></p>
    <details class="dialog-help"><summary>${e('Quando usarlo')}</summary><p>${e('Per esempio, prima di passare dal ramo True al Golden: scegli poi nell’app il ramo che corrisponde al salvataggio caricato nel gioco.')}</p></details>
  </form><div class="dialog-actions"><button type="button" class="btn dialog-cancel" data-action="close-modal">${e('Annulla')}</button><button type="submit" form="branch-form" class="btn primary" data-action="create-profile">${e('Crea e passa al ramo')}</button></div>`;
}
