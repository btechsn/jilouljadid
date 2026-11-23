import type { EventCard } from "@/components/mosque/event-board";

/** Événements Jiloul (contenu réel, sans dates inventées pour Ansaroudine / Guédiawaye). */
export function jiloulEvents(locale: string): EventCard[] {
  const lang = locale === "en" || locale === "ar" ? locale : "fr";

  const copy = {
    fr: {
      ansaroudine: {
        title: "Journée Ansaroudine",
        description: "Journée Ansaroudine au Maroc.",
        body: "La Journée Ansaroudine a rassemblé les disciples et amis du mouvement au Maroc. Prière, enseignement et fraternité ont marqué cette rencontre, dans l’esprit de la voie et de l’unité de la Fayda.",
        location: "Maroc",
      },
      guediawaye: {
        title: "Prière et hadara du vendredi",
        description: "Prière et hadara du vendredi à Guédiawaye.",
        body: "À Guédiawaye, la communauté s’est réunie pour la prière du vendredi, suivie de la hadara. Un moment de recueillement, de rappel et de présence partagée.",
        location: "Guédiawaye",
      },
      imam: {
        title: "Imam Day",
        description:
          "La Journée internationale de l’Imam Cheikh Tidiane Cissé, le 24 janvier 2027, à l’Hôtel King Fahd Palace, Dakar.",
        body: "La Journée internationale de l’Imam Cheikh Tidiane Cissé se tiendra le 24 janvier 2027 à l’Hôtel King Fahd Palace, à Dakar. Conférences, témoignages et moments de fraternité pour honorer l’héritage de l’Imam et accompagner la nouvelle génération.",
        location: "Hôtel King Fahd Palace, Dakar",
      },
    },
    en: {
      ansaroudine: {
        title: "Ansaroudine Day",
        description: "Ansaroudine Day in Morocco.",
        body: "Ansaroudine Day brought together disciples and friends of the movement in Morocco. Prayer, teaching and fellowship marked this gathering, in the spirit of the path and the unity of the Fayda.",
        location: "Morocco",
      },
      guediawaye: {
        title: "Friday prayer and hadara",
        description: "Friday prayer and hadara in Guédiawaye.",
        body: "In Guédiawaye, the community gathered for Friday prayer, followed by the hadara. A moment of recollection, reminder and shared presence.",
        location: "Guédiawaye",
      },
      imam: {
        title: "Imam Day",
        description:
          "The International Day of Imam Cheikh Tidiane Cissé, 24 January 2027, at the King Fahd Palace Hotel, Dakar.",
        body: "The International Day of Imam Cheikh Tidiane Cissé will be held on 24 January 2027 at the King Fahd Palace Hotel in Dakar. Talks, testimonies and fellowship to honour the Imam’s legacy and accompany the new generation.",
        location: "King Fahd Palace Hotel, Dakar",
      },
    },
    ar: {
      ansaroudine: {
        title: "يوم الأنصارودين",
        description: "يوم الأنصارودين في المغرب.",
        body: "جمع يوم الأنصارودين تلاميذ الحركة وأصدقاءها في المغرب. الصلاة والتعليم والأخوة ميّزت هذا اللقاء، بروح الطريق ووحدة الفيضة.",
        location: "المغرب",
      },
      guediawaye: {
        title: "صلاة الجمعة والحضرة",
        description: "صلاة الجمعة والحضرة في غيديواي.",
        body: "في غيديواي اجتمعت الجماعة لصلاة الجمعة ثم الحضرة. لحظة خشوع وتذكير وحضور مشترك.",
        location: "غيديواي",
      },
      imam: {
        title: "يوم الإمام",
        description:
          "اليوم الدولي للإمام الشيخ تجاني سيسي، 24 يناير 2027، بفندق قصر الملك فهد، دكار.",
        body: "يُقام اليوم الدولي للإمام الشيخ تجاني سيسي في 24 يناير 2027 بفندق قصر الملك فهد في دكار. محاضرات وشهادات ولحظات أخوة تكريماً لإرث الإمام ومواكبةً للجيل الجديد.",
        location: "فندق قصر الملك فهد، دكار",
      },
    },
  }[lang];

  return [
    {
      id: "ansaroudine",
      title: copy.ansaroudine.title,
      description: copy.ansaroudine.description,
      body: copy.ansaroudine.body,
      type: "community",
      startAt: "",
      location: copy.ansaroudine.location,
      image: "/events/ansaroudine-1.jpg",
      isFinished: true,
      canRegister: false,
      youtubeUrl: "",
      gallery: [
        "/events/ansaroudine-1.jpg",
        "/events/ansaroudine-2.jpg",
        "/events/ansaroudine-3.jpg",
      ],
    },
    {
      id: "guediawaye",
      title: copy.guediawaye.title,
      description: copy.guediawaye.description,
      body: copy.guediawaye.body,
      type: "special_prayer",
      startAt: "",
      location: copy.guediawaye.location,
      image: "/events/guediawaye-1.jpg",
      isFinished: true,
      canRegister: false,
      youtubeUrl: "",
      gallery: [
        "/events/guediawaye-1.jpg",
        "/events/guediawaye-2.jpg",
        "/events/guediawaye-3.jpg",
      ],
    },
    {
      id: "imam-day",
      title: copy.imam.title,
      description: copy.imam.description,
      body: copy.imam.body,
      type: "community",
      startAt: "2027-01-24T09:00:00+00:00",
      location: copy.imam.location,
      image: "/events/imam-day.jpg",
      isFinished: false,
      canRegister: true,
      youtubeUrl: "",
      gallery: ["/events/imam-day.jpg"],
    },
  ];
}

export function getJiloulEvent(locale: string, id: string): EventCard | undefined {
  return jiloulEvents(locale).find((event) => event.id === id);
}
