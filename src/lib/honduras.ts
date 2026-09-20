export const departments = [
  "Atlántida",
  "Choluteca",
  "Colón",
  "Comayagua",
  "Copán",
  "Cortés",
  "El Paraíso",
  "Francisco Morazán",
  "Gracias a Dios",
  "Intibucá",
  "Islas de la Bahía",
  "La Paz",
  "Lempira",
  "Ocotepeque",
  "Olancho",
  "Santa Bárbara",
  "Valle",
  "Yoro",
] as const;

export type DepartmentName = (typeof departments)[number];

export const departmentViewBox = "0 0 1000 700";

export const departmentMapPaths: Record<DepartmentName, string> = {
  "Atlántida": "M 240 80 L 330 62 L 360 96 L 355 136 L 315 150 L 270 138 L 240 110 Z",
  "Choluteca": "M 470 510 L 520 500 L 580 505 L 590 555 L 570 600 L 520 612 L 475 585 Z",
  "Colón": "M 500 78 L 570 70 L 615 105 L 592 152 L 555 175 L 505 150 L 485 120 L 498 96 Z",
  "Comayagua": "M 315 220 L 380 205 L 430 230 L 420 290 L 360 310 L 315 275 Z",
  "Copán": "M 150 240 L 205 215 L 240 245 L 228 295 L 185 315 L 145 290 Z",
  "Cortés": "M 120 150 L 200 105 L 275 98 L 270 150 L 225 180 L 160 180 L 125 168 Z",
  "El Paraíso": "M 610 300 L 690 280 L 730 340 L 690 410 L 620 410 L 590 360 Z",
  "Francisco Morazán": "M 430 280 L 490 260 L 545 290 L 530 340 L 470 365 L 420 330 Z",
  "Gracias a Dios": "M 800 120 L 885 95 L 940 160 L 910 270 L 840 320 L 780 250 L 790 175 Z",
  "Intibucá": "M 260 340 L 315 310 L 365 330 L 350 385 L 290 405 L 250 380 Z",
  "Islas de la Bahía": "M 330 30 L 360 15 L 390 35 L 360 55 Z M 405 18 L 425 22 L 430 38 L 405 42 Z",
  "La Paz": "M 315 340 L 365 320 L 400 350 L 388 405 L 330 430 L 296 400 Z",
  "Lempira": "M 150 350 L 215 325 L 260 350 L 248 405 L 195 430 L 145 400 Z",
  "Ocotepeque": "M 120 390 L 170 365 L 195 400 L 180 445 L 120 450 L 105 420 Z",
  "Olancho": "M 570 180 L 680 145 L 760 165 L 780 230 L 730 290 L 640 300 L 575 255 Z",
  "Santa Bárbara": "M 85 190 L 140 165 L 195 185 L 180 235 L 125 250 L 85 220 Z",
  "Valle": "M 410 500 L 470 490 L 500 525 L 465 570 L 410 565 L 395 530 Z",
  "Yoro": "M 300 182 L 380 165 L 455 185 L 450 245 L 385 270 L 300 250 Z",
};
