"""
Génération des fichiers audio pour les méditations guidées Moody.
Utilise edge-tts (voix neurales Microsoft Edge, gratuites, sans clé API).

Voix :
  FR → fr-FR-DeniseNeural  (douce, naturelle, apaisante)
  EN → en-US-JennyNeural   (friendly, considerate, comfort)

Usage :
  py scripts/generate-meditations.py

Sortie : public/audio/meditations/{id}_{lang}_{nn}.mp3
"""

import asyncio
import os
import edge_tts

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'meditations')

VOICES = {
    'fr': 'fr-FR-DeniseNeural',
    'en': 'en-US-JennyNeural',
}

# Débit légèrement ralenti pour un rendu apaisant
RATE = '-18%'
VOLUME = '+0%'

# ── Textes extraits de src/lib/meditations.js ──────────────────────────────
MEDITATIONS = {
    'coherence': {
        'fr': [
            "Installe-toi confortablement. Assieds-toi ou allonge-toi dans un endroit calme.",
            "Ferme les yeux si tu le souhaites.",
            "Nous allons pratiquer la cohérence cardiaque : cinq respirations par minute pendant cinq minutes. Laisse ton ventre se gonfler à chaque inspiration.",
            "Inspire...",
            "Expire...",
            "Inspire...",
            "Expire...",
            "Très bien. Continue à ton rythme. Inspire...",
            "Expire... laisse ton corps se détendre à chaque expiration.",
            "Si des pensées arrivent, laisse-les passer comme des nuages. Ramène doucement ton attention à ta respiration.",
            "Inspire...",
            "Expire...",
            "Inspire...",
            "Expire...",
            "Inspire...",
            "Expire...",
            "Inspire une dernière fois... profondément...",
            "Et expire... lentement... complètement.",
            "Bravo. Tu viens de pratiquer cinq minutes de cohérence cardiaque. Prends un moment pour observer comment tu te sens.",
            "Quand tu es prêt·e, ouvre doucement les yeux.",
        ],
        'en': [
            "Find a comfortable position. Sit or lie down in a quiet place.",
            "Close your eyes if you feel comfortable.",
            "We'll practice cardiac coherence: five breaths per minute for five minutes. Let your belly rise with each inhale.",
            "Inhale...",
            "Exhale...",
            "Inhale...",
            "Exhale...",
            "Good. Continue at your own pace. Inhale...",
            "Exhale... let your body relax a little more with each breath out.",
            "If thoughts arise, let them pass like clouds. Gently bring your attention back to your breath.",
            "Inhale...",
            "Exhale...",
            "Inhale...",
            "Exhale...",
            "Inhale...",
            "Exhale...",
            "One last deep inhale...",
            "And exhale... slowly... completely.",
            "Well done. You've just completed five minutes of cardiac coherence. Take a moment to notice how you feel.",
            "When you're ready, gently open your eyes.",
        ],
    },
    'body-scan': {
        'fr': [
            "Allonge-toi confortablement. Laisse ton corps peser sur la surface sous toi.",
            "Ferme les yeux. Respire naturellement.",
            "Nous allons parcourir ton corps des pieds jusqu'à la tête, en relâchant chaque zone.",
            "Porte ton attention sur tes pieds. Sens leur contact avec le sol ou le lit. Relâche-les complètement.",
            "Monte vers tes mollets et tes genoux. Sens leur poids. Laisse-les se détendre.",
            "Tes cuisses maintenant. Sens le contact avec la surface. Relâche.",
            "Ton bassin, tes hanches. Inspire... et en expirant, relâche complètement cette zone.",
            "Ton ventre. Sens-le se soulever et s'abaisser avec ta respiration. Laisse-le se détendre.",
            "Ta poitrine. À chaque expiration, laisse-la s'alourdir agréablement.",
            "Ton dos, de bas en haut. Tous les muscles qui soutiennent ta colonne. Laisse-les partir.",
            "Tes épaules. C'est souvent là que le stress se loge. Laisse-les descendre, loin de tes oreilles.",
            "Tes bras, tes coudes, tes avant-bras, tes mains, jusqu'au bout de tes doigts. Tout relâché.",
            "Ton cou. Devant, derrière, sur les côtés. Relâche doucement.",
            "Ton visage. Tes mâchoires, laisse tes dents se décoller légèrement. Tes joues. Tes yeux, sans effort. Ton front, lisse.",
            "Tout ton corps est maintenant lourd et détendu. Tu es en sécurité.",
            "Reste dans cet état aussi longtemps que tu le souhaites. Bonne nuit.",
        ],
        'en': [
            "Lie down comfortably. Let your body sink into the surface beneath you.",
            "Close your eyes. Breathe naturally.",
            "We'll scan your body from feet to head, releasing tension in each area.",
            "Bring your attention to your feet. Feel their contact with the floor or bed. Let them go completely.",
            "Move up to your calves and knees. Feel their weight. Let them relax.",
            "Your thighs now. Feel the contact with the surface. Release.",
            "Your pelvis and hips. Breathe in... and as you breathe out, release this area completely.",
            "Your belly. Feel it rise and fall with your breath. Let it soften.",
            "Your chest. With each exhale, let it grow pleasantly heavy.",
            "Your back, from bottom to top. All the muscles supporting your spine. Let them go.",
            "Your shoulders. This is often where stress hides. Let them drop away from your ears.",
            "Your arms, elbows, forearms, hands, all the way to your fingertips. Completely released.",
            "Your neck. Front, back, sides. Gently release.",
            "Your face. Let your jaw relax, teeth slightly apart. Your cheeks. Your eyes, effortless. Your forehead, smooth.",
            "Your whole body is now heavy and relaxed. You are safe.",
            "Stay in this state as long as you wish. Good night.",
        ],
    },
    'grounding': {
        'fr': [
            "Assieds-toi confortablement, les pieds à plat sur le sol si possible.",
            "Cette technique d'ancrage va te ramener dans le moment présent en quelques minutes.",
            "Ouvre les yeux, ou garde-les légèrement entrouverts.",
            "Étape un : nomme cinq choses que tu vois autour de toi. Prends le temps de vraiment les regarder.",
            "Étape deux : nomme quatre choses que tu entends. Les sons proches, les sons lointains.",
            "Étape trois : nomme trois choses que tu peux toucher. Sens la texture de chacune.",
            "Étape quatre : nomme deux choses que tu sens, ou cherche une odeur dans l'air autour de toi.",
            "Étape cinq : nomme une chose que tu goûtes, ou remarque simplement le goût de ta bouche en ce moment.",
            "Inspire lentement...",
            "Expire lentement...",
            "Tu es ici, maintenant. L'anxiété diminue chaque fois que tu reviens au présent. Bravo.",
        ],
        'en': [
            "Sit comfortably with your feet flat on the floor if possible.",
            "This grounding technique will bring you back to the present moment in just a few minutes.",
            "Keep your eyes open or slightly open.",
            "Step one: name five things you can see around you. Take your time to really look at each one.",
            "Step two: name four things you can hear. Nearby sounds, distant sounds.",
            "Step three: name three things you can touch. Feel the texture of each one.",
            "Step four: name two things you can smell, or search for a scent in the air around you.",
            "Step five: name one thing you can taste, or simply notice the taste in your mouth right now.",
            "Breathe in slowly...",
            "Breathe out slowly...",
            "You are here, now. Anxiety decreases each time you return to the present. Well done.",
        ],
    },
    'sleep': {
        'fr': [
            "Allonge-toi dans ton lit, dans ta position préférée pour dormir.",
            "Ferme les yeux. Laisse ton corps peser lourdement sur le matelas.",
            "Respire lentement. Chaque expiration t'emmène un peu plus loin dans la détente.",
            "Imagine que tu es dans un endroit calme et sûr. Une forêt, une plage, une pièce chaleureuse.",
            "Dans cet endroit, il fait exactement la bonne température. Tu es en sécurité.",
            "Inspire doucement...",
            "Expire... et laisse aller les pensées de la journée. Elles peuvent attendre demain.",
            "Tes pensées sont comme des vagues qui s'éloignent du rivage. Tu les regardes partir, sans les suivre.",
            "Inspire...",
            "Expire... ton corps devient plus lourd... plus détendu...",
            "Il n'y a rien à faire. Nulle part où aller. Juste ce moment. Juste ce repos.",
            "Inspire doucement...",
            "Expire... tu glisses doucement vers le sommeil...",
            "Bonne nuit.",
        ],
        'en': [
            "Lie down in your bed in your preferred sleeping position.",
            "Close your eyes. Let your body sink heavily into the mattress.",
            "Breathe slowly. Each exhale takes you a little deeper into relaxation.",
            "Imagine you are in a calm, safe place. A forest, a beach, a cozy room.",
            "In this place, the temperature is just right. You are safe.",
            "Breathe in gently...",
            "Breathe out... and let go of the thoughts of the day. They can wait until tomorrow.",
            "Your thoughts are like waves drifting away from the shore. You watch them go, without following them.",
            "Breathe in...",
            "Breathe out... your body grows heavier... more relaxed...",
            "There is nothing to do. Nowhere to go. Just this moment. Just this rest.",
            "Breathe in gently...",
            "Breathe out... drifting softly into sleep...",
            "Good night.",
        ],
    },
    'gratitude': {
        'fr': [
            "Installe-toi confortablement. Prends un moment pour toi avant de clore cette journée.",
            "Ferme les yeux. Inspire lentement.",
            "Expire. Laisse les tensions de la journée s'évaporer.",
            "Je vais te poser trois questions. Prends le temps de vraiment y répondre, intérieurement.",
            "Première question : quelle est une chose qui s'est bien passée aujourd'hui, même toute petite ?",
            "Deuxième question : quelle est une personne qui t'a fait du bien aujourd'hui, ou à qui tu as fait du bien ?",
            "Troisième question : de quoi es-tu reconnaissant·e dans ta vie en ce moment ?",
            "Ces trois choses sont réelles. Elles font partie de ta vie, ce soir.",
            "Inspire une dernière fois...",
            "Expire... et garde ces pensées douces avec toi pour la nuit.",
            "Merci d'avoir pris ce temps pour toi. Bonne nuit.",
        ],
        'en': [
            "Find a comfortable position. Take a moment for yourself before closing this day.",
            "Close your eyes. Breathe in slowly.",
            "Breathe out. Let the tensions of the day evaporate.",
            "I'll ask you three questions. Take your time to truly answer each one, inwardly.",
            "First question: what is one thing that went well today, however small?",
            "Second question: who made you feel good today, or who did you make feel good?",
            "Third question: what are you grateful for in your life right now?",
            "These three things are real. They are part of your life, tonight.",
            "Breathe in one last time...",
            "Breathe out... and carry these gentle thoughts into the night.",
            "Thank you for taking this time for yourself. Good night.",
        ],
    },
}


async def generate_one(text, voice, output_path, rate=RATE):
    """Génère un seul fichier MP3 depuis un texte."""
    communicate = edge_tts.Communicate(text, voice, rate=rate, volume=VOLUME)
    await communicate.save(output_path)


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = sum(len(texts) for med in MEDITATIONS.values() for texts in med.values())
    done = 0

    for med_id, langs in MEDITATIONS.items():
        for lang, steps in langs.items():
            voice = VOICES[lang]
            for idx, text in enumerate(steps):
                filename = f"{med_id}_{lang}_{idx:02d}.mp3"
                out_path = os.path.join(OUTPUT_DIR, filename)
                if os.path.exists(out_path):
                    done += 1
                    print(f"  [skip] {filename}")
                    continue
                try:
                    await generate_one(text, voice, out_path)
                    done += 1
                    print(f"  [{done:3d}/{total}] {filename}")
                except Exception as e:
                    print(f"  [ERR]  {filename} — {e}")

    print(f"\n✅ Terminé — {done} fichiers dans {OUTPUT_DIR}")


if __name__ == '__main__':
    asyncio.run(main())
