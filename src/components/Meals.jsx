import MealItem from './MealItem.jsx';
import useHttp from '../hooks/useHttp.js';
import Error from './Error.jsx';

const requestConfig = {};

export default function Meals() {
  const {
    data: loadedMeals,
    isLoading,
    error,
  } = useHttp(`${import.meta.env.VITE_API_URL}/meals`, requestConfig, []);

  if (isLoading) {
    return <p className="center">Fetching meals...</p>;
  }

  if (error) {
    return <Error title="Failed to fetch meals" message={error} />;
  }

  // if (!data) {
  //   return <p>No meals found.</p>
  // }

  return (
    <div>
      <h2 style={{ color: '#ff4b4f', textAlign: 'center', fontSize: '2rem', fontWeight: 'normal', letterSpacing: '0.1rem' }}>Entrées</h2>
      <ul id="meals">
        {loadedMeals.filter((meal) => meal.category === 'entree').map((meal) => (
          <MealItem key={meal.id} meal={meal} />
        ))}
      </ul>
      <h2 style={{ color: '#ff4b4f', textAlign: 'center', fontSize: '2rem', fontWeight: 'normal', letterSpacing: '0.1rem' }}>Breakfast</h2>
      <ul id="meals">
        {loadedMeals.filter((meal) => meal.category === 'breakfast').map((meal) => (
          <MealItem key={meal.id} meal={meal} />
        ))}
      </ul>
    </div>
  );
}
