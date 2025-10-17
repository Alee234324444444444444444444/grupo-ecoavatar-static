import '../styles/context.css';
import '../images/chest.gif';

function ContextPage() {
  return (
    <div className="context-page">
      {/* Primera fila: 3 columnas */}
      <div className="row first-row">
        <section className="column intro">
          <h3>Bienvenidos al Juego de Cuidado de la Naturaleza</h3>
          <p>
            Este juego está diseñado para crear conciencia sobre la importancia de cuidar el medio ambiente. 
            Aquí, podrás aprender sobre prácticas sostenibles y cómo tus decisiones afectan a la naturaleza.
          </p>
        </section>

        <section className="column">
          <h3>¿Cómo Funciona?</h3>
          <p>
            A través de diferentes desafíos y actividades, podrás tomar decisiones que influirán en la conservación 
            de los ecosistemas dentro del juego. Con cada acción, contribuirás a crear un mundo más verde y saludable.
            {/* <img src="../images/chest.gif" alt="Animación de naturaleza" className="gif" /> */}
          </p>
        </section>

        <section className="column">
          <h3>Objetivo del Juego</h3>
          <p>
            El objetivo principal es aprender y tomar decisiones que beneficien el medio ambiente. 
            Además, podrás competir con otros jugadores y trabajar en equipo para lograr los mejores resultados posibles.
          </p>
        </section>
      </div>

      {/* Segunda fila: 2 columnas */}
      <div className="row second-row">
        <section className="column">
          <h3>¿Por Qué Cuidar la Naturaleza?</h3>
          <p>
            El medio ambiente es crucial para nuestra supervivencia. Cuidar de él es fundamental para garantizar 
            un futuro sostenible para las generaciones venideras. En este juego, te sumergirás en un mundo virtual 
            donde tus elecciones tienen un impacto real.
          </p>
        </section>

        <section className="column">
          <h3>¿Qué Puedes Hacer Aquí?</h3>
          <ul>
            <li>Participar en desafíos sobre conservación.</li>
            <li>Obtener información educativa sobre el medio ambiente.</li>
            <li>Contribuir a la protección de ecosistemas en el juego.</li>
          </ul>
        </section>
      </div>

      {/* Botón de llamada a la acción */}
      <div className="cta-container">
        <p>
          ¡Esperamos que disfrutes la experiencia y aprendas mucho mientras juegas! 
          Tu contribución puede marcar la diferencia en la naturaleza.
        </p>
        <a href="/challenges" className="cta-button">Comienza ahora</a>
      </div>
    </div>
  );
}

export default ContextPage;
