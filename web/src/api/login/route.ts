import { Client } from 'appwrite';

import { NextRequest, NextResponse } from 'next/server';


const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68121f770012fa8e9646');