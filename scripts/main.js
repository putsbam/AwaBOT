module.exports = {
  invertDateAndTranslate: function dateFormatFoda(guildBR, data, mes, ano) {
    if (
      typeof guildBR !== "boolean" &&
      typeof data !== "number" &&
      typeof mes !== "string" &&
      typeof ano !== "number"
    )
      return new Error();

    let FullData;

    if (ano || ano !== undefined) {
      ano = `, ${ano}`;
    } else ano = "";

    if (guildBR == false) {
      FullData = `${mes} ${data}${ano}`;
    } else {
      switch (mes) {
        case "January":
          mes = "Janeiro";
          break;

        case "February":
          mes = "Fevereiro";
          break;

        case "March":
          mes = "Março";
          break;

        case "April":
          mes = "Abril";
          break;

        case "May":
          mes = "Maio";
          break;

        case "June":
          mes = "Junho";
          break;

        case "July":
          mes = "Julho";
          break;

        case "August":
          mes = "Agosto";
          break;

        case "September":
          mes = "Setembro";
          break;

        case "October":
          mes = "Outubro";
          break;

        case "November":
          mes = "Novembro";
          break;

        case "December":
          mes = "Dezembro";
          break;
      }

      FullData = `${data} de ${mes}${ano}`;
    }

    return FullData;
  },

  removeById: function removeById (arr, id){
  const requiredIndex = arr.findIndex(el => {
    return el.id === String(id);
  });
  if (requiredIndex === -1) {
    return false;
  };
  return !!arr.splice(requiredIndex, 1);
},

}