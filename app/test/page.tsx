 "use client";


import { useState, useEffect } from "react";

// const Page = () => {
//   const [post, setPost] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetch("https://jsonplaceholder.typicode.com/posts")
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error("Network response was not ok");
//         }
//         return res.json();
//       })
//       .then((data) => {
//         setPost(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError("Failed to fetch data");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
//           <p className="mt-4 text-amber-800 font-medium">Loading posts...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <p className="text-red-800 font-medium">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-amber-900 mb-2">
//             Latest Posts
//           </h1>
//           <p className="text-amber-700">Discover our collection of articles</p>
//         </div>

//         <div className="space-y-6">
//           {post.map((item) => (
//             <div
//               key={item.id}
//               className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-amber-100"
//             >
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
//                   {item.id}
//                 </div>
//                 <div className="flex-1">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-3 capitalize leading-tight">
//                     {item.title}
//                   </h2>
//                   <p className="text-gray-600 leading-relaxed">{item.body}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;





type RandomUser = {
  name: { first: string; last: string };
  email: string;
  picture: { thumbnail: string };
};

const Page = () => {

  const [users, setUsers] = useState<RandomUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try{
      const recentRes = await fetch("https://randomuser.me/api/?results=5")

      if (!recentRes.ok) {
        throw new Error("Network response was not ok");
      }
      const franksData = await recentRes.json();
      setUsers(franksData.results);
    } catch(err){
      setError("Failed to fetch data")
    }finally{
      setLoading(false)
    }

  }

  // useEffect(() => {
  //   fetchUsers()
  // })

// if(loading){
//     return <div>Loading...</div>
// }

if(error){
    return <div>{error}</div>
}
  return (
    <div>
      <h1>franks random user</h1>
{
users.map((user, index) => (
    <div key={index}>
        <p>{user.name.first} {user.name.last}</p>
        <p>{user.email}</p>
        <img src={user.picture.thumbnail} alt="user pic" />
    </div>
))
}
<button onClick={fetchUsers} className="bg-amber-600">Fetch Users</button>
    </div>
  )
};

export default Page;
