<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Validator;

class AuthController extends Controller
{
    public function __construct(){
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    public function register(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:4,20',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',     // Uppercase password
                'regex:/[a-z]/',     // Lowercase password
                'regex:/[0-9]/',     // Number password
                'regex:/[@$!%*?&#]/' //Alphanumeric password
            ],
        ]);

        if ($validator->fails()){
            return response()->json($validator->errors()->toJson(), 400);
        }

        try{
            $imageName = 'defaultProfile.jpg';
            $existUser = User::first();

            //Si no existe un usuario, se creará uno con  privilege admin
            if (!$existUser){
                $privilege = 'admin';
                $user = User::create(array_merge(
                    $validator->validated(),
                    [
                        'password' => bcrypt($request->password),
                        'privilege' => $privilege,
                        'userImage' => $imageName,
                    ]
                ));
            }
            return response()->json(['message' => 'El usuario se ha creado con éxito', 'user' => $user], 201);

        } catch (\Exception $exception){
            return response()->json(['message' => 'No se ha podido crear el usuario', 'error' => $exception->getMessage()], 500);
        }
    }

    public function login(Request $request){
        
        $validator = Validator::make($request->all(),[
            'email' => 'required|email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',     // Uppercase password
                'regex:/[a-z]/',     // Lowercase password
                'regex:/[0-9]/',     // Number password
                'regex:/[@$!%*?&#]/' //Alphanumeric password
            ],
        ]);


        if (! $token = auth()->attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->createNewToken($token);
        
        }

        public function logout(){
            auth()->logout();
            return response()->json(['message' => 'User successfully signed out']);
        }
    
        // Crea un nuevo token en un corto periodo de tiempo para invalidar el usuario que está logued en eses momento si el token JWT no es nuevo.
        public function refresh(){
            return $this->createNewToken(auth()->refresh());
        }
            
        // Renderiza los datos del usuario que ha iniciado sesión 
        public function userProfile() {
        $user = Auth::user(); 

        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        return response()->json($user);
        }
    
     
    
        // Crea un nuevo token de autentificación JWT durante el tiempo que hemos puesto (expires_in)
        protected function createNewToken($token){
            return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => auth()->user()
            ]);
        }
}
