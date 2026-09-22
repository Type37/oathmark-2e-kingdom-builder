// Name tables from Knave: Second Edition (Ben Milton, Questing Beast LLC, 2024),
// pp60-61: Male, Female, Surname (first half + second half).
// Knave's mechanics are freely reusable; the tables are the game's mechanics.

const MALE = ["Alaric","Aldous","Alton","Archibald","Arne","Arthur","Balthazar","Bard","Bartholomew","Bartlett","Basil","Baxton","Benedict","Bennett","Beorn","Bertram","Burchard","Cadman","Caspian","Chadwick","Clovis","Conrad","Corbett","Crispin","Cyprian","Cyrus","Daegal","Denis","Destrian","Drogo","Eldon","Ellis","Elric","Emil","Erasmus","Faustus","Felix","Finn","Finnian","Fitzhugh","Florian","Fox","Galileo","Giles","Godfrey","Godwin","Grimwald","Hamlin","Hannibal","Hildebrand","Jasper","Jeremiah","Johan","Jules","Kenric","Leif","Leopold","Leoric","Lothar","Lucian","Merrick","Milo","Mordred","Mortimer","Neville","Odel","Ogden","Orion","Orvyn","Osric","Oswald","Paschal","Percival","Peregrine","Piers","Quentin","Randolf","Redmaine","Reinhold","Rex","Ricard","Roland","Rufus","Silas","Stilton","Stratford","Sylvio","Tenpiece","Thaddeus","Torsten","Tristan","Urban","Valentin","Valerian","Virgil","Warrick","Waverly","Webster","Wilkin","Wymond"];

const FEMALE = ["Adelaide","Agnes","Alma","Anastasia","Anika","Annora","Astrid","Barsaba","Beatrix","Bethel","Bianca","Blanche","Bodil","Bridget","Brunhilde","Calypso","Catalina","Cecilia","Celeste","Charlotte","Cleopha","Clotilde","Clover","Colette","Constance","Damaris","Daphne","Demona","Desirae","Ella","Elsbeth","Esme","Eulalia","Euphemia","Eydis","Fern","Fiora","Fleur","Florence","Francesca","Gertrude","Giselle","Godiva","Guinevere","Heloise","Henrietta","Hester","Hippolyta","Honora","Imogene","Ingrid","Ione","Iris","Isabetta","Isolde","Jacquette","Jeanne","Jessamine","Jilly","Lavinia","Lisbet","Madelena","Margot","Marian","Marigold","Matilda","Melisande","Millicent","Minerva","Morgan","Nerissa","Odette","Olga","Olivia","Orchid","Pepper","Petra","Philomena","Phoebe","Piety","Poppy","Portia","Rosalind","Rose","Sabina","Sif","Sigourney","Sigrid","Silence","Sybil","Tabitha","Trillby","Ulfhild","Ursula","Vivian","Wendy","Willow","Winifred","Yvette","Zora"];

const SURNAME_A = ["Adder","Apple","Ash","Bab","Bag","Bar","Barrow","Basker","Beau","Beetle","Berry","Bird","Brandy","Bright","Brindle","Bull","Bux","Caven","Chelten","Chester","Chuff","Chum","Clod","Cobble","Cotten","Cress","Crom","Cumber","Dela","Dig","Draw","Dreg","Drol","Dun","Even","Ever","Fair","Fallow","Farthing","Feather","Ferns","Fox","Gam","Gird","Gos","Grey","Grim","Half","Hard","Harrow","Hart","Haver","Hedge","Hither","Holly","Honey","Horn","Kettle","Kings","Little","Long","Love","Middle","Mug","Nether","Never","Obling","Pember","Penning","Pens","Pinker","Porten","Quill","Rath","Sack","Sallow","Salt","Scor","Sedge","Silver","Slither","Smit","Snod","Souther","Stew","Stir","Swine","Tar","Temple","Tide","Tread","Under","Vander","Weather","Wester","Wex","Whit","Wither","Withing","Wy"];

const SURNAME_B = ["bald","barrow","batch","beck","blood","bold","bone","bottle","bottom","bridge","buck","burn","bury","by","caster","castle","chester","child","church","cliff","cloth","coat","combe","cott","dale","dish","ditch","down","fax","feld","fent","fer","field","foot","force","fort","fry","gale","grass","grave","green","grove","ham","hill","hope","lack","lain","land","less","lin","ling","lish","lock","long","low","ly","man","march","mark","marl","marsh","mass","meer","mond","mont","mor","morn","nick","ny","port","ridge","row","sea","set","shot","sop","spoon","staff","stoke","stone","ten","thorn","thorpe","throp","ton","tooth","top","vane","ville","wald","wark","watch","water","well","whistle","wick","wood","worm","worth","worthy"];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// A surname is one half from each list, joined without the hyphen.
export const knaveSurname = () => pick(SURNAME_A) + pick(SURNAME_B);
// A ruler: given name plus surname. The kingdom name borrows the surname half,
// so a realm ruled by Alaric Grimstone might well be called Grimstone.
export const knaveRuler = () => `${pick([...MALE, ...FEMALE])} ${knaveSurname()}`;
export const knaveKingdom = () => `${pick(SURNAME_A)}${pick(SURNAME_B)}`;

// One roll fills both.
export function knaveRealm() {
  const surname = knaveSurname();
  const given = pick([...MALE, ...FEMALE]);
  return { name: surname, ruler: `${given} ${surname}` };
}
