<?php

namespace App\Http\Controllers;

class HomeController extends Controller
{
    public function index()
    {
        return view('welcome', [
            'appName' => '__CT_PROJECT_NAME__',
            'status' => 'CodersTrim Laravel 13 Core Active'
        ]);
    }
}
